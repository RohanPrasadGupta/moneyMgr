import { useQuery, UseQueryResult } from "@tanstack/react-query";
import type { Note } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type NoteApiResponse<T> = {
  message?: string;
  data?: T;
  errMsg?: string;
};

async function parseNoteResponse<T>(res: Response): Promise<T> {
  const json: NoteApiResponse<T> = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.errMsg || json.message || "Request failed");
  }
  return json.data as T;
}

export async function fetchAllNotes(): Promise<Note[]> {
  const res = await fetch(`${API_URL}/api/allnotes`);
  const data = await parseNoteResponse<Note[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function fetchNote(id: string): Promise<Note> {
  const res = await fetch(`${API_URL}/api/getNote/${id}`);
  return parseNoteResponse<Note>(res);
}

export async function createNote(payload: { title: string; content: string }): Promise<Note> {
  const res = await fetch(`${API_URL}/api/addNote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseNoteResponse<Note>(res);
}

export async function updateNote(
  id: string,
  payload: { title: string; content: string }
): Promise<Note> {
  const res = await fetch(`${API_URL}/api/updateNote/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseNoteResponse<Note>(res);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/deleteNote/${id}`, {
    method: "DELETE",
  });
  const json: NoteApiResponse<unknown> = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.errMsg || json.message || "Failed to delete note");
  }
}

export const notesQueryKey = ["getNotes"] as const;

export const useNotesQuery = (): UseQueryResult<Note[], Error> => {
  return useQuery({
    queryKey: notesQueryKey,
    queryFn: fetchAllNotes,
  });
};
