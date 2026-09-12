import React from 'react';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
  danger?: boolean;
};

export default function IconButton({ icon, label, danger, className = '', ...props }: IconButtonProps) {
  return <button type='button' aria-label={label} title={label}
    className={`icon-button ${danger ? 'icon-button-danger' : ''} ${className}`} {...props}>
    <img src={icon} alt='' draggable={false} />
  </button>;
}
