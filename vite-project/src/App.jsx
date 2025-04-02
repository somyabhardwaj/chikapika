import React from 'react';
import Message from "./Message";
import Test from "./Test"
import {BrowserRouter, Routes,Route} from 'react-router-dom';
function App() {
  return (<>
    <BrowserRouter >
       <Routes>
        <Route path = "/message" element={<Message />} />
        <Route path = "/test" element = {<Test />} />
       </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
