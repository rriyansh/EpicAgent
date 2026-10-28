import { FileInfo, AnalysisResult } from '../types';

export interface TerminalResult {
  stdout: string;
  stderr: string;
  command: string;
  args: string[];
}

const API_BASE = '/api';

export async function listAllowedCommands(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/system/terminal/commands`);
  if (!response.ok) {
    throw new Error('Failed to fetch allowed commands');
  }
  const data = await response.json();
  return data.commands;
}

export async function runSafeCommand(command: string, args: string[], onUpdate?: (result: TerminalResult) => void): Promise<TerminalResult> {
  const response = await fetch(`${API_BASE}/terminal/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, args, confirmed: true })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Command execution failed');
  }
  
  return response.json();
}

export async function uploadFile(file: File): Promise<{ success: boolean; path?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/files/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'File upload failed');
  }
  
  return response.json();
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/files/analyze`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'File analysis failed');
  }
  
  return response.json();
}

export async function getFileInfo(path: string): Promise<FileInfo> {
  const response = await fetch(`${API_BASE}/files/info/${encodeURIComponent(path)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch file info');
  }
  
  return response.json();
}

export async function listFiles(path: string = ''): Promise<FileInfo[]> {
  const url = new URL(`${API_BASE}/files/list`);
  if (path) url.searchParams.set('path', path);
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error('Failed to list files');
  }
  
  return response.json();
}

export async function downloadFile(path: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/files/download/${encodeURIComponent(path)}`);
  
  if (!response.ok) {
    throw new Error('Failed to download file');
  }
  
  return response.blob();
}

export async function createDirectory(path: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/files/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, type: 'directory' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create directory');
  }
  
  return response.json();
}

export async function deleteFile(path: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/files/delete/${encodeURIComponent(path)}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete file');
  }
  
  return response.json();
}

export async function moveFile(source: string, destination: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/files/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to move file');
  }
  
  return response.json();
}

export async function getSystemInfo(): Promise<any> {
  const response = await fetch(`${API_BASE}/system/info`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch system info');
  }
  
  return response.json();
}

export async function executeAgentChat(messages: any[], model?: string, temperature?: number, provider?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, temperature, provider })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute agent chat');
  }
  
  return response.json();
}

export async function getProviders(): Promise<any> {
  const response = await fetch(`${API_BASE}/agent/providers`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch providers');
  }
  
  return response.json();
}
