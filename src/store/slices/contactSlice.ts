import { ChatState, Contact } from '../../types/types';

type ContactSlice = {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
};

export const createContactSlice = (set: any): ContactSlice => ({
  contacts: [],
  
  addContact: (contact: Contact) => {
    set((state: ChatState) => ({
      contacts: [...state.contacts, contact],
    }));
  },
});
