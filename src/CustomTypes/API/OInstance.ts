import axios from 'axios';
import chalk from 'chalk';

class OInstance {
    connected: boolean = false;
    url: string;
    debug: boolean = false;
    apiTag: string = chalk.yellow("[")+chalk.green("API")+chalk.yellow("]");

    constructor(url: string = "127.0.0.1:14434", debug: boolean = false) {
        this.url = url;

        this.reconnect();
    
    }

    reconnect() {
        axios.get(this.url).then((response) => {
            if (this.debug) {
                console.log(this.apiTag + " Connected to Ollama")
            }
            this.connected = true;
        }).catch((error) => {
            if (this.debug) {
                console.log(this.apiTag + " Could not connect to Ollama")
                throw new Error(chalk.red(error))
            } else {
                throw new Error(chalk.red(error))
            }
            this.connected = false;
        });
    }

    getURL() {
        return this.url;
    }

    isConnected() {
        return this.connected;
    }

}

export default OInstance;