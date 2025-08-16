const Chatbot = () => {
    return ( 
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Chat with Marvel</h2>
            <p className="text-gray-700 mb-4">Ask me anything about the Marvel universe!</p>
            <div className="flex items-center">
                <input 
                    type="text" 
                    placeholder="Type your question..." 
                    className="flex-grow border border-gray-300 rounded-lg p-2 mr-2"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
            </div>
        </div>
    )
}
export default Chatbot;