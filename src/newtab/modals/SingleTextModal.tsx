import React from 'react';

import Modal from './Modal';

interface SingleTextModalProps {
  title: string;
  inputLabel: string;
  placeHolder: string;
  cancelBtnText: string;
  okBtnText: string;
  isOpen: boolean;
  initialValue?: string;
  onClose: () => void;
  onCreate: (title: string) => void | Promise<void>;
}

const SingleTextModal: React.FC<SingleTextModalProps> = ({
  title,
  inputLabel,
  placeHolder,
  cancelBtnText,
  okBtnText,
  isOpen,
  onClose,
  onCreate,
  initialValue = '',
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError('');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) {
    return null;
  }

  const handleCreate = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await onCreate(value.trim());
    } catch (reason) {
      setError(String(reason));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Modal
      onClose={() => {
        if (!saving) onClose();
      }}
      label={title}
    >
      <div
        id='new-workspace-dialog'
        className='bg-toby-bg-gray relative flex w-300 flex-col items-start justify-between rounded-md px-24 py-12 opacity-100 shadow-md'
      >
        <div
          id='new-workspace-dialog-title'
          className='mb-15 text-[18px] font-bold'
        >
          {title}
        </div>
        <div id='new-workspace-dialog-input-hint' className='mb-10 text-[14px]'>
          {inputLabel}
        </div>
        <input
          type='text'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={inputLabel}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleCreate();
          }}
          autoFocus
          className='focus:ring-toby-blue h-25 w-full flex-0 rounded-md border border-gray-300 px-4 py-10 text-[14px] focus:ring-2 focus:outline-none'
          placeholder={placeHolder}
        />
        {error && <p role='alert'>{error}</p>}
        <div
          id='new-workspace-dialog-buttons'
          className='mt-15 flex w-full flex-row items-center justify-around'
        >
          <button
            type='button'
            disabled={saving}
            id='new-workspace-dialog-cancel'
            onClick={handleClose}
            className='text-toby-blue mr-5 flex basis-1/2 cursor-pointer items-center justify-center rounded-md px-10 py-5 font-bold'
          >
            {cancelBtnText}
          </button>
          <button
            type='button'
            disabled={saving || !value.trim()}
            id='new-workspace-dialog-confirm'
            onClick={handleCreate}
            className={`flex basis-1/2 cursor-pointer items-center justify-center rounded-md px-10 py-5 font-bold outline-1 ${value.trim() ? 'bg-toby-blue text-toby-bg-gray outline-0' : 'text-gray-300 outline-gray-300'} `}
          >
            {okBtnText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SingleTextModal;
