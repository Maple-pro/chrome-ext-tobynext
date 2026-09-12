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
      <div id='new-workspace-dialog' className='modal-content'>
        <h2 id='new-workspace-dialog-title' className='modal-title'>{title}</h2>
        <label id='new-workspace-dialog-input-hint' className='modal-label' htmlFor='modal-title-input'>{inputLabel}</label>
        <input id='modal-title-input' type='text' value={value} onChange={event => setValue(event.target.value)}
          aria-label={inputLabel} onKeyDown={event => { if (event.key === 'Enter') void handleCreate(); }}
          autoFocus className='modal-input' placeholder={placeHolder} />
        {error && <p className='inline-error' role='alert'>{error}</p>}
        <div id='new-workspace-dialog-buttons' className='modal-actions'>
          <button type='button' disabled={saving} id='new-workspace-dialog-cancel' onClick={handleClose} className='secondary-button'>{cancelBtnText}</button>
          <button type='button' disabled={saving || !value.trim()} id='new-workspace-dialog-confirm' onClick={handleCreate} className='primary-button'>{saving ? 'Saving…' : okBtnText}</button>
        </div>
      </div>
    </Modal>
  );
};

export default SingleTextModal;
