// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App.jsx';
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function add(title) { fireEvent.change(screen.getByLabelText('Task name'), {target:{value:title}}); fireEvent.click(screen.getByRole('button',{name:'Add task'})); }
test('adds, edits, completes, restores, and deletes a task', () => {
 render(<App/>); add('Read a chapter');
 fireEvent.click(screen.getByRole('button',{name:'Edit Read a chapter'}));
 fireEvent.change(screen.getByLabelText('Edit task name'),{target:{value:'Read two chapters'}});
 fireEvent.click(screen.getByRole('button',{name:'Save changes'}));
 expect(screen.getByText('Read two chapters')).toBeVisible();
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete Read two chapters'}));
 expect(screen.queryByText('Read two chapters')).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:/Completed/}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Reopen Read two chapters'}));
 fireEvent.click(screen.getByRole('button',{name:/Active/}));
 fireEvent.click(screen.getByRole('button',{name:'Delete Read two chapters'}));
 expect(screen.queryByText('Read two chapters')).not.toBeInTheDocument();
});
test('persists title and deadline across remount', () => {
 const view=render(<App/>);
 fireEvent.change(screen.getByLabelText('Deadline (optional)'),{target:{value:'2026-12-20'}});
 add('Plan my week'); view.unmount(); render(<App/>);
 expect(screen.getByText('Plan my week')).toBeVisible();
 expect(screen.getByText(/Dec 20/)).toBeVisible();
});
test('rejects whitespace-only titles', () => {render(<App/>); add('   '); expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();});
test('caps priorities at three and completion frees a slot', () => {
 render(<App/>); ['One','Two','Three','Four'].forEach(add);
 for(const name of ['One','Two','Three']) fireEvent.click(screen.getByRole('button',{name:`Prioritize ${name}`}));
 expect(screen.getByRole('button',{name:'Prioritize Four'})).toBeDisabled();
 fireEvent.click(screen.getByRole('checkbox',{name:'Complete One'}));
 expect(screen.getByRole('button',{name:'Prioritize Four'})).toBeEnabled();
 fireEvent.click(screen.getByRole('button',{name:'Prioritize Four'}));
 expect(screen.getByRole('button',{name:'Unprioritize Four'})).toBeVisible();
});
test('malformed saved data recovers without crashing', () => {localStorage.setItem('ahil-planner-v1','{"bad":true}');render(<App/>);expect(screen.getByText(/Saved tasks could not be read/)).toBeVisible();add('Fresh start');expect(screen.getByText('Fresh start')).toBeVisible();});
test('storage write failure is visible while tasks remain usable', () => {vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});render(<App/>);add('Keep working');expect(screen.getByText('Keep working')).toBeVisible();expect(screen.getByRole('alert')).toHaveTextContent('cannot save');});
test('preserves unreadable storage until a new task and backs up original', () => {
 const raw='[{"title":"recover me"}]'; localStorage.setItem('ahil-planner-v1',raw);
 render(<App/>); expect(localStorage.getItem('ahil-planner-v1')).toBe(raw);
 add('New task'); expect(localStorage.getItem('ahil-planner-v1-recovery')).toBe(raw);
});
test('detects another tab writing and does not overwrite its tasks', () => {
 render(<App/>);
 const external=JSON.stringify([{id:'external',title:'Other tab',due:'',completed:false,priority:false}]);
 localStorage.setItem('ahil-planner-v1',external);
 add('My unsaved task');
 expect(localStorage.getItem('ahil-planner-v1')).toBe(external);
 expect(screen.getByRole('alert')).toHaveTextContent('another tab');
});
