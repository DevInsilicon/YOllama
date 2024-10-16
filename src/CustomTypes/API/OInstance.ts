import axios from 'axios';

class OInstance {
    connected: boolean = false;
    url: string;
    debug: boolean = false;
    apiTag: string = "[API] ";

    constructor(urll: string = "http://127.0.0.1:14434", debug: boolean = false) {
        this.url = urll;

        this.reconnect();
    
    }

    reconnect() {
        axios.get(this.url).then((response) => {
            console.log(response.data);
            this.connected = true;
        }).catch((error) => {
            this.connected = false;
            console.log(error);
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