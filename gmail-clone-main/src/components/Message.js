import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import pen from "../images/pen.png"
import { TextField } from '@mui/material';
import { addDoc, collection, doc } from 'firebase/firestore';
import { auth, database } from '../firebase/setup';

const style = {
  position: 'absolute',
  top: '71%',
  left: '77%',
  transform: 'translate(-50%, -50%)',
  width: "37vw",
  height: "35vw",
  minHeight: "505px",
  bgcolor: 'background.paper',
  padding: "1vw",
};

export default function Message() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [mailId, setMailId] = React.useState("")
  const [message, setMessage] = React.useState("")

  const send = async () => {
    const userDoc = doc(database, "Users", `${auth.currentUser?.email}`)
    const messageRef = collection(userDoc, "Send")
    try {
      await addDoc(messageRef, {
        email: message
      })
    } catch (err) {
      console.error(err)
    }
  }

  const inbox = async () => {
    const userDoc = doc(database, "Users", `${mailId}`)
    const messageRef = collection(userDoc, "Inbox")
    try {
      await addDoc(messageRef, {
        email: message,
        sender: auth.currentUser?.displayName
      })
      send()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div onClick={handleOpen} variant='contained' style={{
  borderRadius: '20px', 
  backgroundColor: 'gray', 
  color: 'black', 
  fontSize: '1.3vw', 
  width: 'fit-content', 
  height: 'auto', 
  padding: '20px 30px', 
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#f0f0f0',
    cursor: 'pointer' 
  },
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  textTransform: 'none',
  overflow: 'hidden', 
}}>
        <img src={pen} style={{ width: '1vw', marginRight: '1vw' }} alt="Pen" />
  <span>Schreiben</span>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography style={{
            backgroundColor: "#EDF9FF", position: 'absolute',
            top: "0", left: "0", width: "38vw", padding: "0.5vw", fontSize: "1vw"
          }}>
            Neue Nachricht
          </Typography>
          <TextField onChange={(e) => setMailId(e.target.value)} variant='standard' label="To" sx={{ width: "37vw", marginTop: "1vw" }} />
          <br />
          <TextField variant='standard' label="Subject" sx={{ width: "37vw" }} />
          <br />
          <TextField onChange={(e) => setMessage(e.target.value)} multiline rows={12} sx={{ width: "37vw", "& fieldset": { border: "none" } }} />
          <br />
          <Button onClick={inbox} variant='contained' sx={{
  borderRadius: '20px', 
  backgroundColor: '#blue', 
  color: 'white', 
  padding: '10px 20px', 
  textTransform: 'none',
  top:"20%",
  boxShadow: '0 3px 5px 2px rgba(0, 105, 217, .3)', 
  '&:hover': {
    backgroundColor: '#0059b2', 
  },
}}>
  Send
</Button>

        </Box>
      </Modal>
    </div>
  );
}
