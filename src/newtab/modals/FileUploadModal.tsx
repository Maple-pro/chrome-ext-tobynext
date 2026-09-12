import React, { useState } from 'react';

import { useNewTabContext } from '../context/NewTabContext';
import Modal from './Modal';

interface FileUploadModalProps {
  onClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace, refresh, setCurrentSpace } = useNewTabContext();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFileRead(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handleFileRead(droppedFile);
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);
        importBookmarks(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  const importBookmarks = async (data: any) => {
    if (!currentWorkspace) {
      return;
    }

    if (data.version !== 3 || !Array.isArray(data.lists)) {
      console.error('Invalid JSON format');
      return;
    }

    setLoading(true);

    const defaultSpace = await chrome.bookmarks.create({
      title: 'Toby Space',
      parentId: currentWorkspace.id,
      index: 0,
    });

    try {
      let num = 0;
      for (const list of data.lists) {
        const folder = await chrome.bookmarks.create({
          title: list.title,
          parentId: defaultSpace.id,
        });
        for (const card of list.cards) {
          if (!(card.url as string).startsWith('http')) {
            continue;
          }
          await chrome.bookmarks.create({
            parentId: folder.id,
            title: card.title,
            url: card.url,
          });
        }
        num++;
        console.log('Import collection num: ', num);
      }
      alert('Bookmarks imported successfully!');
      onClose();
    } catch (error) {
      console.error('Error importing bookmarks: ', error);
    } finally {
      setLoading(false);
      refresh();
      setCurrentSpace(defaultSpace);
    }
  };

  return (
    <Modal onClose={onClose} label='Import bookmarks'>
      <div className='modal-content'>
        <h2 className='modal-title'>Import Bookmarks</h2>
        {loading ? (
          <div className='mx-auto flex items-center justify-center'>
            <svg
              className='text-toby-blue h-20 w-20 animate-spin'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v8H4z'
              ></path>
            </svg>
          </div>
        ) : (
          <div
            className={`file-drop ${dragging ? 'drop-inside' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <p>{file.name}</p>
            ) : (
              <p>Drop your Toby export here, or choose a JSON file.</p>
            )}
            <input
              type='file'
              accept='.json'
              onChange={handleFileSelect}
              aria-label='Choose Toby JSON file'
            />
          </div>
        )}
        <div className='modal-actions'>
          <button
            type='button' className='secondary-button'
            onClick={onClose}
          >
            CANCEL
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
