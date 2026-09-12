import React, { JSX } from 'react';

import { useNewTabContext } from '../context/NewTabContext';

const workspaceColors = [
  'bg-red-300',
  'bg-orange-300',
  'bg-amber-300',
  'bg-yellow-300',
  'bg-lime-300',
  'bg-green-300',
  'bg-emerald-300',
  'bg-teal-300',
  'bg-cyan-300',
  'bg-sky-300',
];

const outlineColors = [
  'outline-red-300',
  'outline-orange-300',
  'outline-amber-300',
  'outline-yellow-300',
  'outline-lime-300',
  'outline-green-300',
  'outline-emerald-300',
  'outline-teal-300',
  'outline-cyan-300',
  'outline-sky-300',
];

const Workspaces = (): JSX.Element => {
  const { currentWorkspace, setCurrentWorkspace, workspaces } =
    useNewTabContext();

  return (
    <div
      id='workspaces'
      className='flex flex-col items-center justify-center px-5'
    >
      {workspaces.map((workspace, index) => (
        <div
          key={workspace.id}
          id={'workspace-' + workspace.title}
          onClick={() => setCurrentWorkspace(workspace)}
          className={`mb-10 flex h-40 w-40 cursor-pointer items-center justify-center rounded-xl px-2 ${workspaceColors[index % workspaceColors.length]} ${
            currentWorkspace && currentWorkspace.id === workspace.id
              ? `outline-2 outline-offset-2 outline-solid ${outlineColors[index % outlineColors.length]}`
              : ''
          }`}
        >
          <div
            id='workspace-name'
            className='text-toby-bg-gray truncate text-center leading-[1.2]'
          >
            {workspace.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Workspaces;
