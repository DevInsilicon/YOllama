const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

const apiUrl = 'http://127.0.0.1:11434/api/generate';
const chatApiUrl = 'http://127.0.0.1:11434/api/chat';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_STORAGE_FILE = 'chat_storage.json';
const DEFAULT_EXPIRATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

async function moderateWithOpenAI(content) {
    try {
        const response = await axios.post('https://api.openai.com/v1/moderations', {
            input: content,
            model: "text-moderation-latest"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        const result = response.data.results[0];
        const isHarmful = result.flagged;

        return {
            harmful: isHarmful,
            categories: result.categories,
            category_scores: result.category_scores
        };
    } catch (error) {
        console.error('Error in OpenAI content moderation:', error);
        throw error;
    }
}

function ollamaRequestPromise(model_id, request, onToken) {
    return new Promise((resolve, reject) => {
        const requestBody = {
            model: model_id,
            prompt: request,
            stream: true
        };

        let fullResponse = '';

        console.log(`Sending request to Ollama API for model: ${model_id}`);
        console.log(`Request body: ${JSON.stringify(requestBody)}`);

        axios.post(apiUrl, requestBody, { responseType: 'stream' })
            .then(response => {
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.response) {
                                fullResponse += parsed.response;
                                if (onToken) onToken(parsed.response);
                            }
                            if (parsed.done) {
                                console.log('Ollama API response complete');
                                resolve(fullResponse);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                });

                response.data.on('end', () => {
                    if (!fullResponse) {
                        console.warn('No response generated from Ollama API');
                        reject(new Error('No response generated'));
                    }
                });
            })
            .catch(error => {
                console.error('Error in Ollama API request:', error);
                reject(error);
            });
    });
}

async function ollamaRequestAsync(model_id, request) {
    const requestBody = {
        model: model_id,
        prompt: request,
        stream: false
    };

    try {
        const response = await axios.post(apiUrl, requestBody);
        return response.data.response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

function ollamaRequest(model_id, request) {
    return new Promise((resolve, reject) => {
        const requestBody = {
            model: model_id,
            prompt: request,
            stream: false
        };

        axios.post(apiUrl, requestBody)
            .then(response => {
                resolve(response.data.response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

async function loadChatStorage() {
    try {
        const data = await fs.readFile(CHAT_STORAGE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return an empty object
            return {};
        }
        throw error;
    }
}

async function saveChatStorage(storage) {
    await fs.writeFile(CHAT_STORAGE_FILE, JSON.stringify(storage, null, 2));
}

async function cleanupExpiredChats() {
    const storage = await loadChatStorage();
    const now = Date.now();
    let changed = false;

    for (const [chatId, chat] of Object.entries(storage)) {
        if (chat.expirationTimestamp && chat.expirationTimestamp < now) {
            delete storage[chatId];
            changed = true;
        }
    }

    if (changed) {
        await saveChatStorage(storage);
    }
}

async function ChatStream(chatId, model, message, onToken) {
    const storage = await loadChatStorage();

    if (!storage[chatId]) {
        storage[chatId] = {
            messages: [],
            expirationTimestamp: Date.now() + DEFAULT_EXPIRATION
        };
    }

    storage[chatId].messages.push({ role: 'user', content: message });
    await saveChatStorage(storage);

    return new Promise((resolve, reject) => {
        const requestBody = {
            model: model,
            messages: storage[chatId].messages,
            stream: true
        };

        console.log(`Sending request to Ollama Chat API for model: ${model}`);
        console.log(`Request body: ${JSON.stringify(requestBody)}`);

        axios.post(chatApiUrl, requestBody, { responseType: 'stream' })
            .then(response => {
                let fullResponse = '';
                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message && parsed.message.content) {
                                fullResponse += parsed.message.content;
                                if (onToken) onToken(parsed.message.content);
                            }
                            if (parsed.done) {
                                console.log('Ollama Chat API response complete');
                                storage[chatId].messages.push({ role: 'assistant', content: fullResponse });
                                saveChatStorage(storage);
                                resolve(fullResponse);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                });

                response.data.on('end', () => {
                    if (!fullResponse) {
                        console.warn('No response generated from Ollama Chat API');
                        reject(new Error('No response generated'));
                    }
                });
            })
            .catch(error => {
                console.error('Error in Ollama Chat API request:', error);
                reject(error);
            });
    });
}

// Run cleanup periodically (e.g., every hour)
setInterval(cleanupExpiredChats, 60 * 60 * 1000);

module.exports = {
    ollamaRequestPromise,
    ollamaRequestAsync,
    ollamaRequest,
    moderateWithOpenAI,
    ChatStream
};