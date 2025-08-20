import axios from "axios";
export const query = (query: string) => { 
    return axios.get('http://localhost:8000/query/', {
        headers: {
            'query': query
        }
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.error('Error:', error);
        throw error;
    });
}

        