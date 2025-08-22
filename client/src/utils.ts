import axios from "axios";
export const query = (query: string, id: string) => { 
    return axios.get('http://localhost:8000/query/', {
        headers: {
            'Query': query,
            'Session-Id': id
        }
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.error('Error:', error.response?.data || error);
        throw error;
    });
}

        