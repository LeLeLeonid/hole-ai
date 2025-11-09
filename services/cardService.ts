import { CharaCardV3 } from '../types';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// A minimal PNG chunk reader for the browser.
async function parsePngForChara(file: File): Promise<string | null> {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);

    // Check PNG signature
    if (dataView.getUint32(0) !== 0x89504E47 || dataView.getUint32(4) !== 0x0D0A1A0A) {
        console.error("Not a valid PNG file.");
        return null;
    }

    let offset = 8;
    while (offset < buffer.byteLength) {
        const length = dataView.getUint32(offset);
        const type = new TextDecoder().decode(new Uint8Array(buffer, offset + 4, 4));
        
        if (type === 'tEXt' || type === 'zTXt') {
            const chunkData = new Uint8Array(buffer, offset + 8, length);
            const nullSeparatorIndex = chunkData.indexOf(0);
            if (nullSeparatorIndex === -1) continue;
            
            const keyword = new TextDecoder().decode(chunkData.slice(0, nullSeparatorIndex));

            if (keyword === 'chara') {
                let textData;
                if (type === 'zTXt') {
                    // compressed, keyword\0compression_method(1 byte)\0data
                    const compressionMethod = chunkData[nullSeparatorIndex + 1];
                    if (compressionMethod !== 0) {
                        console.error('Unsupported compression method in zTXt chunk');
                        continue;
                    }
                    const compressedData = chunkData.slice(nullSeparatorIndex + 2);
                    try {
                        // @ts-ignore - DecompressionStream is available in modern browsers
                        const ds = new DecompressionStream('deflate');
                        const writer = ds.writable.getWriter();
                        writer.write(compressedData);
                        writer.close();
                        const decompressedStream = await new Response(ds.readable).arrayBuffer();
                        textData = new TextDecoder().decode(decompressedStream);
                    } catch (e) {
                        console.error("Failed to decompress zTXt chunk:", e);
                        return "DECOMPRESSION_ERROR";
                    }
                } else { // tEXt
                    textData = new TextDecoder().decode(chunkData.slice(nullSeparatorIndex + 1));
                }

                try {
                    return atob(textData);
                } catch (e) {
                    console.error("Failed to decode base64 from chara data", e);
                    return "BASE64_DECODE_ERROR";
                }
            }
        }
        
        offset += 12 + length; // 4 for length, 4 for type, length for data, 4 for CRC
    }

    return null;
}

const normalizeCard = (json: any): CharaCardV3 | { error: string } => {
    // Check if it's a valid v2 or v3 card
    if (json.spec && json.spec.startsWith('chara_card_v') && (json.data || json.name)) {
        if (!json.data) { // It's likely a v2 card, let's upgrade it
            json.data = { ...json };
            // Populate essential v3 data fields from top-level v2 fields
            json.data.creator_notes = json.creatorcomment || '';
            json.data.system_prompt = json.system_prompt || '';
            json.data.post_history_instructions = json.post_history_instructions || '';
            json.data.alternate_greetings = json.alternate_greetings || [];
            json.data.tags = json.tags || [];

            json.spec = 'chara_card_v3'; // Upgrade spec for consistency
            json.spec_version = '3.0'; // mock v3
        }
        return json as CharaCardV3;
    }
     // Support for simple JSON structures from some sites like Wyvern
    if (!json.spec && json.name && json.description) {
        const newCard: CharaCardV3 = {
            spec: 'chara_card_v3',
            spec_version: '3.0',
            name: json.name,
            description: json.description,
            personality: json.personality || '',
            scenario: json.scenario || '',
            first_mes: json.first_mes || json.greeting || '',
            mes_example: json.mes_example || '',
            creatorcomment: json.creator_notes || '',
            avatar: 'none',
            talkativeness: '0.5',
            fav: false,
            tags: json.tags || [],
            create_date: json.created_at || new Date().toISOString(),
            data: {
                name: json.name,
                description: json.description,
                personality: json.personality || '',
                scenario: json.scenario || '',
                first_mes: json.first_mes || json.greeting || '',
                mes_example: json.mes_example || '',
                creator_notes: json.creator_notes || '',
                system_prompt: json.system_prompt || '',
                post_history_instructions: json.post_history_instructions || '',
                tags: json.tags || [],
                creator: json.user__username || '',
                character_version: json.version || '1.0',
                alternate_greetings: json.alternate_greetings || [],
                extensions: {
                    talkativeness: '0.5', fav: false, world: '',
                    depth_prompt: { prompt: '', depth: 4, role: 'system' }
                },
                group_only_greetings: [],
            }
        };
        return newCard;
    }
    return { error: 'Invalid or unrecognized card format.' };
}

export const processCardFile = async (file: File): Promise<CharaCardV3 | { error: string }> => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            return normalizeCard(json);
        } catch (e) {
            return { error: 'Failed to parse JSON file.' };
        }
    }

    if (file.type === 'image/png') {
        try {
            const charaJsonString = await parsePngForChara(file);
            if (!charaJsonString) {
                return { error: 'No character data found in PNG. Try JSON.' };
            }
            if (charaJsonString === 'DECOMPRESSION_ERROR' || charaJsonString === 'BASE64_DECODE_ERROR') {
                return { error: 'Failed to extract data from PNG. Try JSON.' };
            }
            const json = JSON.parse(charaJsonString);
            return normalizeCard(json);
        } catch (e) {
             return { error: 'Failed to parse character data from PNG. Try JSON.' };
        }
    }

    return { error: 'Unsupported file type. Please use .json or .png' };
}

export const processCardUrl = async (url: string): Promise<CharaCardV3 | { error: string }> => {
    let targetUrl = url;
    
    try {
        const hostname = new URL(url).hostname;
        if (hostname.includes('chub.ai')) {
            // e.g., https://chub.ai/characters/Enkob/the-magic-nation-of-xeocan-magic-academy-2631791032a4
            // becomes https://chub.ai/card/Enkob/the-magic-nation-of-xeocan-magic-academy-2631791032a4.png
            const path = new URL(url).pathname.replace('/characters/', '/card/') + '.png';
            targetUrl = `https://chub.ai${path}`;
        } else if (hostname.includes('wyvern.chat')) {
             // e.g., https://app.wyvern.chat/characters/_y8wW33tCApMxUatNUKpy7
            // becomes https://app.wyvern.chat/api/characters/public/_y8wW33tCApMxUatNUKpy7
            const path = new URL(url).pathname.replace('/characters/', '/api/characters/public/');
            targetUrl = `https://app.wyvern.chat${path}`;
        }
        
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from URL. Status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const fileName = targetUrl.split('/').pop() || 'file';
        const file = new File([blob], fileName, { type: blob.type });

        return await processCardFile(file);

    } catch (error) {
        console.error("Error processing URL:", error);
        return { error: (error as Error).message };
    }
};