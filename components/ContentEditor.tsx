import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useCustomContent } from '../hooks/useCustomContent';
import type { CharaCardV3, CustomContentType } from '../types';
import { processCardFile, processCardUrl } from '../services/cardService';

interface ContentEditorProps {
  onBack: () => void;
}

const MenuButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({ onClick, children, disabled }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <button 
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        disabled={disabled}
        style={{
          backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
          color: disabled ? theme.colors.disabledText : (isHovered ? theme.colors.highlightText : theme.colors.text),
          cursor: disabled ? 'default' : 'pointer',
        }}
        className="p-2 text-xl tracking-widest bg-transparent border-none"
      >
        [ {children} ]
      </button>
    );
};

const TabButton: React.FC<{onClick: () => void, isActive: boolean, children: React.ReactNode}> = ({ onClick, isActive, children }) => {
    const { theme } = useTheme();
    return (
        <button
            onClick={onClick}
            className="p-2 text-lg"
            style={{
                borderBottom: `2px solid ${isActive ? theme.colors.accent1 : 'transparent'}`,
                color: isActive ? theme.colors.accent1 : theme.colors.text,
            }}
        >
            {children}
        </button>
    );
}

const cardTemplate: CharaCardV3 = {
  "name": "", "description": "", "personality": "", "scenario": "", "first_mes": "", "mes_example": "",
  "creatorcomment": "", "avatar": "none", "talkativeness": "0.5", "fav": false, "tags": [],
  "spec": "chara_card_v3", "spec_version": "3.0",
  "data": {
    "name": "", "description": "", "personality": "", "scenario": "", "first_mes": "", "mes_example": "",
    "creator_notes": "", "system_prompt": "", "post_history_instructions": "", "tags": [], "creator": "",
    "character_version": "", "alternate_greetings": [],
    "extensions": {
      "talkativeness": "0.5", "fav": false, "world": "",
      "depth_prompt": { "prompt": "", "depth": 4, "role": "system" }
    },
    "group_only_greetings": []
  },
  "create_date": new Date().toISOString().replace('T', ' @').replace('Z', ''),
};


export const ContentEditor: React.FC<ContentEditorProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const { customContent, addContent, removeContent } = useCustomContent();
  const [activeTab, setActiveTab] = useState<'import' | 'create' | 'manage'>('import');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [newCard, setNewCard] = useState<CharaCardV3>(JSON.parse(JSON.stringify(cardTemplate)));
  const [pendingCard, setPendingCard] = useState<CharaCardV3 | null>(null);

  
  const handleFeedback = (message: string, duration: number = 5000) => {
      setFeedback(message);
      if (duration > 0) {
        setTimeout(() => setFeedback(null), duration);
      }
  }

  const handleCardLoaded = (card: CharaCardV3 | {error: string}) => {
      if ('error' in card) {
          handleFeedback(`Error: ${card.error}`);
      } else {
          handleFeedback(`Loaded "${card.data.name}". Please classify it.`, 0);
          setPendingCard(card);
      }
  };

  const handleSaveWithType = (type: CustomContentType) => {
    if (!pendingCard) return;
    addContent(pendingCard, type);
    handleFeedback(`Success! "${pendingCard.data.name}" added as a ${type}.`);
    setPendingCard(null);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      handleFeedback(`Processing ${file.name}...`, 0);
      const result = await processCardFile(file);
      handleCardLoaded(result);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
  };

  const handleJsonPaste = () => {
      if (!jsonText.trim()) return;
      try {
          const parsed = JSON.parse(jsonText);
          handleCardLoaded(parsed); // Let the service normalize it
          setJsonText('');
      } catch (e) {
          handleFeedback("Error: Invalid JSON text.");
      }
  };
  
  const handleUrlImport = async () => {
        if (!urlText.trim()) return;
        handleFeedback(`Fetching from URL...`, 0);
        const result = await processCardUrl(urlText);
        handleCardLoaded(result);
  };
  
  const handleCreateCard = (type: CustomContentType) => {
        if (!newCard.data.name.trim()) {
            handleFeedback("Card must have a name.");
            return;
        }
        addContent(newCard, type);
        handleFeedback(`Card "${newCard.data.name}" created as a ${type}!`);
        setNewCard(JSON.parse(JSON.stringify(cardTemplate)));
  }

  const exportCard = (card: CharaCardV3) => {
        const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${card.data.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  };

  const renderImport = () => (
    <div className="space-y-6">
        <div>
            <h3 className="text-xl mb-2">Import from File (.json, .png)</h3>
            <p className="text-sm opacity-70 mb-2">You can find character cards at: <a href="https://aicharactercards.com/" target="_blank" rel="noopener noreferrer" style={{color: theme.colors.accent2}}>aicharactercards.com</a>, <a href="https://chub.ai" target="_blank" rel="noopener noreferrer" style={{color: theme.colors.accent2}}>chub.ai</a>, or <a href="https://character-tavern.com" target="_blank" rel="noopener noreferrer" style={{color: theme.colors.accent2}}>character-tavern.com</a></p>
            <input type="file" accept=".json,.png,application/json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <MenuButton onClick={() => fileInputRef.current?.click()}>SELECT FILE</MenuButton>
        </div>
         <div>
            <h3 className="text-xl mb-2">Import from URL</h3>
            <div className="flex gap-2">
                 <input type="text" value={urlText} onChange={e => setUrlText(e.target.value)} placeholder="https://chub.ai/characters/..." className="flex-grow p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} />
                 <MenuButton onClick={handleUrlImport}>FETCH</MenuButton>
            </div>
        </div>
        <div>
            <h3 className="text-xl mb-2">Import from JSON Text</h3>
            <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={5} className="w-full p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} placeholder="Paste character card JSON here..." />
            <MenuButton onClick={handleJsonPaste}>IMPORT TEXT</MenuButton>
        </div>
    </div>
  );
  
  const renderCreate = () => {
    const handleDataChange = (field: keyof CharaCardV3['data'], value: string) => {
        setNewCard(prev => {
            const updated = { ...prev, data: { ...prev.data, [field]: value } };
            // Sync top-level fields for convenience
            if (field === 'name' || field === 'description' || field === 'scenario' || field === 'first_mes') {
                (updated as any)[field] = value;
            }
            return updated;
        });
    };
    return (
    <div className="space-y-4">
        <input type="text" placeholder="Character Name*" value={newCard.data.name} onChange={e => handleDataChange('name', e.target.value)} className="w-full p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} />
        <textarea placeholder="Description" value={newCard.data.description} onChange={e => handleDataChange('description', e.target.value)} rows={3} className="w-full p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} />
        <textarea placeholder="Scenario / Setting" value={newCard.data.scenario} onChange={e => handleDataChange('scenario', e.target.value)} rows={3} className="w-full p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} />
        <textarea placeholder="First Message (Greeting)" value={newCard.data.first_mes} onChange={e => handleDataChange('first_mes', e.target.value)} rows={3} className="w-full p-2 bg-black bg-opacity-30 border" style={{borderColor: theme.colors.accent1}} />
        <div className="flex gap-4">
            <MenuButton onClick={() => handleCreateCard('scenario')}>SAVE AS SCENARIO</MenuButton>
            <MenuButton onClick={() => handleCreateCard('character')}>SAVE AS CHARACTER</MenuButton>
        </div>
    </div>
  )};

  const renderManage = () => {
    const scenarios = customContent.filter(item => item.type === 'scenario');
    const characters = customContent.filter(item => item.type === 'character');
    
    const renderList = (items: typeof scenarios, title: string) => (
        <div className="flex-1 flex flex-col min-w-0">
            <h3 className="text-2xl mb-2 text-center" style={{color: theme.colors.accent2}}>-=[ {title} ]=-</h3>
            <div className="flex-grow p-2 overflow-y-auto" style={{border: `1px solid ${theme.colors.accent1}`}}>
                 {items.length === 0 ? <p className="text-center opacity-50">No {title.toLowerCase()} yet.</p> : (
                    <ul className="space-y-2">
                        {items.map(item => (
                            <li key={item.card.data.name} className="p-2 flex justify-between items-center" style={{border: `1px solid ${theme.colors.disabledText}`}}>
                                <div>
                                    <p className="text-xl">{item.card.data.name}</p>
                                    <p className="text-sm opacity-70">{item.card.data.description.substring(0, 50)}...</p>
                                </div>
                                <div className="flex gap-2">
                                    <MenuButton onClick={() => exportCard(item.card)}>EXPORT</MenuButton>
                                    <MenuButton onClick={() => removeContent(item.card.data.name)}>DELETE</MenuButton>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex gap-4 h-full">
            {renderList(scenarios, "Scenarios")}
            {renderList(characters, "Characters")}
        </div>
    );
  };

  const renderMainContent = () => {
    if (pendingCard) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl mb-4">Classify Imported Card</h2>
                <p className="mb-2">Card: <span style={{color: theme.colors.accent2}}>{pendingCard.data.name}</span></p>
                <p className="mb-6">How should this content be used in the game?</p>
                <div className="flex gap-4">
                    <MenuButton onClick={() => handleSaveWithType('scenario')}>As a SCENARIO</MenuButton>
                    <MenuButton onClick={() => handleSaveWithType('character')}>As a CHARACTER</MenuButton>
                    <MenuButton onClick={() => setPendingCard(null)}>CANCEL</MenuButton>
                </div>
            </div>
        )
    }
    switch(activeTab) {
        case 'import': return renderImport();
        case 'create': return renderCreate();
        case 'manage': return renderManage();
        default: return null;
    }
  };


  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-4" style={{ color: theme.colors.accent1 }}>[ CONTENT MANAGER ]</h1>
      
      <div className="w-full max-w-5xl flex-grow flex flex-col mb-4">
        {!pendingCard && (
            <div className="flex gap-4 mb-4 border-b" style={{borderColor: theme.colors.accent1}}>
                <TabButton isActive={activeTab === 'import'} onClick={() => setActiveTab('import')}>Import</TabButton>
                <TabButton isActive={activeTab === 'create'} onClick={() => setActiveTab('create')}>Create</TabButton>
                <TabButton isActive={activeTab === 'manage'} onClick={() => setActiveTab('manage')}>Manage ({customContent.length})</TabButton>
            </div>
        )}
        <div className="flex-grow p-4 overflow-y-auto" style={{border: `1px solid ${theme.colors.accent1}`}}>
            {renderMainContent()}
        </div>
         {feedback && (
            <div className="w-full text-center p-2 mt-4" style={{backgroundColor: theme.colors.highlightBg, color: theme.colors.highlightText}}>
                {feedback}
            </div>
        )}
      </div>

      <div className="flex gap-4 mt-2">
        <MenuButton onClick={onBack} disabled={!!pendingCard}>BACK</MenuButton>
      </div>
    </div>
  );
};