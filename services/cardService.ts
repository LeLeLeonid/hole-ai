import { CharaCardV3 } from '../types';

const CORS_PROXY = 'https://cors.sh/'; // Switched to a more reliable proxy

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
    // Helper to strip simple HTML tags
    const stripHtml = (text: string | undefined | null): string => {
        return text ? text.replace(/<[^>]*>?/gm, '') : '';
    };

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
        
        // Clean fields that might have HTML
        json.description = stripHtml(json.description);
        json.data.description = stripHtml(json.data.description);
        json.scenario = stripHtml(json.scenario);
        json.data.scenario = stripHtml(json.data.scenario);
        json.first_mes = stripHtml(json.first_mes);
        json.data.first_mes = stripHtml(json.data.first_mes);

        return json as CharaCardV3;
    }
     // Support for simple JSON structures from sites like Wyvern or Chub API
    if (!json.spec && json.name && json.description) {
        const newCard: CharaCardV3 = {
            spec: 'chara_card_v3',
            spec_version: '3.0',
            name: json.name,
            description: stripHtml(json.description),
            personality: json.personality || '',
            scenario: stripHtml(json.scenario),
            first_mes: stripHtml(json.first_mes || json.greeting),
            mes_example: json.mes_example || '',
            creatorcomment: json.creator_notes || '',
            avatar: 'none',
            talkativeness: '0.5',
            fav: false,
            tags: json.tags || [],
            create_date: json.created_at || new Date().toISOString(),
            data: {
                name: json.name,
                description: stripHtml(json.description),
                personality: json.personality || '',
                scenario: stripHtml(json.scenario),
                first_mes: stripHtml(json.first_mes || json.greeting),
                mes_example: json.mes_example || '',
                creator_notes: json.creator_notes || '',
                system_prompt: json.system_prompt || '',
                post_history_instructions: json.post_history_instructions || '',
                tags: json.tags || [],
                creator: json.creator || json.user__username || '', // Added support for chub's 'creator' field
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
    try {
        const hostname = new URL(url).hostname;

        if (hostname.includes('chub.ai')) {
            // Chub has a public API, but some characters 404. We'll try API first, then fallback to download.
            const characterPath = new URL(url).pathname.replace('/characters/', '');
            const apiUrl = `https://api.chub.ai/v1/characters/${characterPath}`;
            
            let apiFailed = false;
            let apiStatus = 0;

            try {
                const response = await fetch(apiUrl);
                apiStatus = response.status;
                if (response.ok) {
                    const json = await response.json();
                    // The actual card data is in the 'definition' property.
                    if (json && json.definition) {
                        return normalizeCard(json.definition);
                    } else {
                        // Response OK but no definition, mark as failed to trigger fallback
                        apiFailed = true;
                    }
                } else {
                    apiFailed = true;
                }
            } catch (e) {
                apiFailed = true;
                console.error("Direct Chub API fetch failed:", e);
            }

            if (apiFailed) {
                console.warn(`Chub API failed for ${apiUrl} (Status: ${apiStatus}). Attempting fallback download.`);
                const downloadUrl = `${url.split('?')[0]}/download?format=tavern`; // Ensure no query params on base url
                const proxiedDownloadUrl = `${CORS_PROXY}${downloadUrl}`;
                
                const downloadResponse = await fetch(proxiedDownloadUrl);

                if (!downloadResponse.ok) {
                     throw new Error(`Failed to fetch from Chub API (Status: ${apiStatus}) and fallback download also failed (Status: ${downloadResponse.status}).`);
                }
                
                const blob = await downloadResponse.blob();
                // The tavern format downloads as a png
                const file = new File([blob], "character.png", { type: 'image/png' });
                return await processCardFile(file);
            }

            // This part should be unreachable if logic is correct, but as a safeguard:
            return { error: 'Could not process Chub.ai URL.' };
        }

        // For other sites that need it, use a CORS proxy.
        let targetUrl = url;
        if (hostname.includes('wyvern.chat')) {
             // e.g., https://app.wyvern.chat/characters/_y8wW33tCApMxUatNUKpy7
            // becomes https://app.wyvern.chat/api/characters/public/_y8wW33tCApMxUatNUKpy7
            const path = new URL(url).pathname.replace('/characters/', '/api/characters/public/');
            targetUrl = `https://app.wyvern.chat${path}`;
        }
        
        const proxiedUrl = `${CORS_PROXY}${targetUrl}`;
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch from URL via proxy (Status: ${response.status}). The proxy may be down or the URL is incorrect.`);
        }
        
        const blob = await response.blob();
        const fileName = targetUrl.split('/').pop() || 'file';
        const file = new File([blob], fileName, { type: blob.type });

        return await processCardFile(file);

    } catch (error) {
        console.error("Error processing URL:", error);
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        return { error: errorMessage };
    }
};