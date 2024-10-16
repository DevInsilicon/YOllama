import OInstance from "./OInstance.js";
import axios from 'axios';


class ContextClass {

    ollama?: OInstance;
    debug: boolean = false;


    /**
     * Creates an instance of ContextClass. Which is used for single context API calls.
     * @constructor
     * @param {OInstance} [ollama] - An instance of OInstance for Ollama API connection.
     * @param {boolean} [debug=false] - Enable debug mode for additional logging.
     * @throws {Error} If OInstance is not provided.
     */
    constructor(ollama?: OInstance, debug: boolean = false) {
        this.ollama = ollama;
        this.debug = debug;

        if (!ollama) {
            throw new Error("OInstance is required in ContextClass constructor");
        }

        if (!ollama.isConnected()) {
            console.log("Warning! " +"OInstance failed to connect to Ollama, you will need to call connect() method to connect to Ollama.");
        } else {
            if (debug) {
                console.log("Ollama is connected");
            }
        }
    }

    
    /**
    * Converts a text input into a JSON structure using AI interpretation.
    * @param {string} model_id - The ID of the AI model to use for conversion.
    * @param {string} text_input - The text to be converted into JSON.
    * @param {boolean} [stream=false] - Whether to stream the response.
    * @param {((token: string) => void) | null} [onToken=null] - Callback function for handling streamed tokens.
    * @returns {Promise<any>} A promise that resolves to the JSON interpretation of the input text.
    * @throws {Error} If the Ollama URL is not available or if the response is invalid JSON.
    */
    public async generateT2J(
        model_id: string,
        text_input: string,
        stream: boolean = false,
        onToken: ((token: string) => void) | null = null
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const apiUrl = this.ollama?.getURL() + "/api/generate";
            if (!apiUrl) {
                reject(new Error('Ollama URL is not available'));
                return;
            }

            const requestBody = {
                model: model_id,
                prompt: `Convert the following text into a JSON structure:\n\n${text_input}\n\nGenerate a JSON response that captures the key information from the text. The response should be a valid JSON object.`,
                stream: stream,
                format: "json"
            };

            console.log(`Sending TextToJson request to Ollama API for model: ${model_id}`);
            console.log(`Request body: ${JSON.stringify(requestBody)}`);

            if (stream) {
                let fullResponse = '';

                axios.post(apiUrl, requestBody, { responseType: 'stream' })
                    .then(response => {
                        response.data.on('data', (chunk: Buffer) => {
                            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                            for (const line of lines) {
                                try {
                                    const parsed: any = JSON.parse(line);
                                    if (parsed.response) {
                                        fullResponse += parsed.response;
                                        if (onToken) onToken(parsed.response);
                                    }
                                    if (parsed.done) {
                                        console.log('Ollama API TextToJson response complete');
                                        try {
                                            const jsonResponse = JSON.parse(fullResponse);
                                            resolve(jsonResponse);
                                        } catch (error) {
                                            reject(new Error('Invalid JSON response'));
                                        }
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
                        console.error('Error in Ollama API TextToJson request:', error);
                        reject(error);
                    });
            } else {
                axios.post(apiUrl, requestBody)
                    .then(response => {
                        try {
                            const jsonResponse = JSON.parse(response.data.response);
                            resolve(jsonResponse);
                        } catch (error) {
                            reject(new Error('Invalid JSON response'));
                        }
                    })
                    .catch(error => {
                        console.error('Error in Ollama API TextToJson request:', error);
                        reject(error);
                    });
            }
        });
    }


    /**
    * Generates a JSON response based on a provided JSON input using AI interpretation.
    * @param {string} model_id - The ID of the AI model to use.
    * @param {any} provided_json - The JSON input to send to the AI.
    * @param {boolean} [stream=false] - Whether to stream the response.
    * @param {((token: string) => void) | null} [onToken=null] - Callback function for handling streamed tokens.
    * @param {string} [prompt="\n\nBased on the above conversation..."] - Custom prompt to append to the JSON input.
    * @returns {Promise<any>} A promise that resolves to the AI's JSON response.
    * @throws {Error} If the Ollama URL is not available or if the response is invalid JSON.
    */
    public async generateJ2J(
        model_id: string,
        provided_json: any,
        stream: boolean = false,
        onToken: ((token: string) => void) | null = null,
        prompt: string = "\n\nBased on the above conversation, generate a JSON response for the next assistant message. The response should be in the format: {\"name\": \"Assistant\", \"type\": \"response\", \"message\": \"Your generated message here\"}"
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const apiUrl = this.ollama?.getURL() + "/api/generate";
            if (!apiUrl) {
                reject(new Error('Ollama URL is not available'));
                return;
            }

            const requestBody = {
                model: model_id,
                prompt: JSON.stringify(provided_json) + prompt,
                stream: stream,
                format: "json"
            };

            console.log(`Sending JSON request to Ollama API for model: ${model_id}`);
            console.log(`Request body: ${JSON.stringify(requestBody)}`);

            if (stream) {
                let fullResponse = '';

                axios.post(apiUrl, requestBody, { responseType: 'stream' })
                    .then(response => {
                        response.data.on('data', (chunk: Buffer) => {
                            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                            for (const line of lines) {
                                try {
                                    const parsed: any = JSON.parse(line);
                                    if (parsed.response) {
                                        fullResponse += parsed.response;
                                        if (onToken) onToken(parsed.response);
                                    }
                                    if (parsed.done) {
                                        console.log('Ollama API JSON response complete');
                                        try {
                                            const jsonResponse = JSON.parse(fullResponse);
                                            resolve(jsonResponse);
                                        } catch (error) {
                                            reject(new Error('Invalid JSON response'));
                                        }
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
                        console.error('Error in Ollama API JSON request:', error);
                        reject(error);
                    });
            } else {
                axios.post(apiUrl, requestBody)
                    .then(response => {
                        try {
                            const jsonResponse = JSON.parse(response.data.response);
                            resolve(jsonResponse);
                        } catch (error) {
                            reject(new Error('Invalid JSON response'));
                        }
                    })
                    .catch(error => {
                        console.error('Error in Ollama API JSON request:', error);
                        reject(error);
                    });
            }
        });
    }


    /**
    * Generates a text response based on the given request using AI interpretation.
    * @param {string} model_id - The ID of the AI model to use.
    * @param {string} request - The text request to send to the AI.
    * @param {boolean} [stream=false] - Whether to stream the response.
    * @param {((token: string) => void) | null} [onToken=null] - Callback function for handling streamed tokens.
    * @returns {Promise<string>} A promise that resolves to the AI's text response.
    * @throws {Error} If the Ollama URL is not available or if no response is generated.
    */
    public async generateTextResponse(
        model_id: string,
        request: string,
        stream: boolean = false,
        onToken: ((token: string) => void) | null = null
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const apiUrl = this.ollama?.getURL() + "/api/generate";
            if (!apiUrl) {
                reject(new Error('Ollama URL is not available'));
                return;
            }

            const requestBody = {
                model: model_id,
                prompt: request,
                stream: stream
            };

            console.log(requestBody);

            console.log(`Sending request to Ollama API for model: ${model_id}`);
            console.log(`Request body: ${JSON.stringify(requestBody)}`);

            if (stream) {
                let fullResponse = '';

                axios.post(apiUrl, requestBody, { responseType: 'stream' })
                    .then(response => {
                        response.data.on('data', (chunk: Buffer) => {
                            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                            for (const line of lines) {
                                try {
                                    const parsed: any = JSON.parse(line);
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
            } else {
                axios.post(apiUrl, requestBody)
                    .then(response => {
                        resolve(response.data.response);
                    })
                    .catch(error => {
                        console.error('Error in Ollama API request:', error);
                        reject(error);
                    });
            }
        });
    }


    /**
 * Generates a text response based on the given request, including support for images and files.
 * @param {string} model_id - The ID of the AI model to use (must support multimodal inputs if images are provided).
 * @param {string} request - The text request to send to the AI.
 * @param {Object} [options] - Additional options for the request.
 * @param {boolean} [options.stream=false] - Whether to stream the response.
 * @param {((token: string) => void) | null} [options.onToken=null] - Callback function for handling streamed tokens.
 * @param {File[]} [options.files=[]] - Array of File objects to be sent with the request.
 * @returns {Promise<string>} A promise that resolves to the AI's text response.
 * @throws {Error} If the Ollama URL is not available, if no response is generated, or if there's an error processing files.
 */
    public async generateFileTextResponse(
        model_id: string,
        request: string,
        options: {
            stream?: boolean;
            onToken?: ((token: string) => void) | null;
            files?: File[];
        } = {}
    ): Promise<string> {
        const { stream = false, onToken = null, files = [] } = options;

        // Step 1: Check if blobs exist and create them if necessary
        for (const file of files) {
            const fileBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const blobDigest = `sha256:${hashHex}`;

            // Check if blob exists
            try {
                await axios.head(`${this.ollama?.getURL()}/api/blobs/${blobDigest}`);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    // Blob doesn't exist, create it
                    const formData = new FormData();
                    formData.append('file', file);
                    await axios.post(`${this.ollama?.getURL()}/api/blobs/${blobDigest}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    throw error;
                }
            }
        }

        // Step 2: Prepare the generate request
        const apiUrl = `${this.ollama?.getURL()}/api/generate`;
        const requestBody: any = {
            model: model_id,
            prompt: request,
            stream: stream,
            images: files.map(file => file.name) // Assuming the server knows how to handle these file names
        };

        // Step 3: Send the request and handle the response
        try {
            if (stream) {
                const response = await axios.post(apiUrl, requestBody, { responseType: 'stream' });
                let fullResponse = '';

                for await (const chunk of response.data) {
                    const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
                    for (const line of lines) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.response) {
                                fullResponse += parsed.response;
                                if (onToken) onToken(parsed.response);
                            }
                            if (parsed.done) {
                                return fullResponse;
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }

                throw new Error('Stream ended without completion');
            } else {
                const response = await axios.post(apiUrl, requestBody);
                return response.data.response;
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error in Ollama API request:', error.response?.data || error.message);
                throw new Error(`Ollama API request failed: ${error.message}`);
            }
            throw error;
        }
    }



    /**
     * This method is used to send a file to the Ollama API for processing. This is not a normal API call, but a special case.
     */
    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

}

export default ContextClass;