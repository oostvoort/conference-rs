import {useRef} from 'react';
import 'react-quill/dist/quill.snow.css';
import {useParams} from "react-router-dom";
import useCollaborate from "../../../../hooks/useRoom/useCollaborate";
import ReactQuill from "react-quill";

function MeetingNotesComponents() {
  const quillRef = useRef<ReactQuill>(null);

  const isAudioOnly = window.location.pathname.includes('voice')
  const roomPrefix = isAudioOnly ? 'voice' : 'av'
  const {id} = useParams()
  const room = `${roomPrefix}-${id}`

  useCollaborate({ room, quill: quillRef })

  return <ReactQuill theme="snow" ref={quillRef}/>;
}

export default MeetingNotesComponents;
