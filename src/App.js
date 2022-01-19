import React, { useRef, useState } from 'react';
import './App.css';
import { formatRelative } from 'date-fns';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // your config
  apiKey: "AIzaSyBkUmtKkyNIyNOljdtQO52MRNwf2_xZ0yI",
  authDomain: "chatapp-6ff50.firebaseapp.com",
  projectId: "chatapp-6ff50",
  storageBucket: "chatapp-6ff50.appspot.com",
  messagingSenderId: "557828150133",
  appId: "1:557828150133:web:6537a2a88272926164b93c",
  measurementId: "G-3L3YNBFPQF"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
//const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);
 
  //if (user) return <Channel user={user} />;

  return (
    <div className="App">
      <header>
        <h1>💬 </h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatArea /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatArea() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type your message here..." />

      <button type="submit" disabled={!formValue}>Send</button>

    </form>
  </>)
}

const formatDate = date => {
  let formattedDate = '';
  if (date) {
    // Convert the date in words relative to the current date
    formattedDate = formatRelative(date, new Date());
    // Uppercase the first letter
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  return formattedDate;
};

function ChatMessage(props) {
  
  const { text, uid, photoURL, createdAt } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    
      
      

    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
      
      <span className="text-gray-500 text-xs">
        {formatDate(new Date(createdAt.seconds * 1000))}
      </span>
      
    </div>

  </>)
}


export default App;