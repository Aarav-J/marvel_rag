import React from 'react'

const Chatbar = () => {
  return (
   <div className="border border-gray-300 shadow-md rounded-lg p-6 w-2/5 h- flex-row gap-2 flex">
        <input type="text" placeholder="Ask away..." className="rounded-lg h-full w-21/25 text-white placeholder-gray-400 focus:outline-none focus:ring-0 " />
        <button className='bg-marvel-red text-white text-center items-center justify-center rounded-lg px-4 py-2'>Send</button>
    </div>
  )
}

export default Chatbar