import { useState, useEffect } from 'react';

// Singleton Store implementation
class RegistryStore {
  constructor() {
    this.commandsMap = new Map();
    this.listeners = new Set();
  }

  getCommands() {
    return Array.from(this.commandsMap.values());
  }

  register(command) {
    const cmds = Array.isArray(command) ? command : [command];
    let changed = false;

    cmds.forEach((c) => {
      if (c.id) {
        this.commandsMap.set(c.id, c);
        changed = true;
      }
    });

    if (changed) {
      this.notify();
    }
  }

  unregister(commandId) {
    const ids = Array.isArray(commandId) ? commandId : [commandId];
    let changed = false;

    ids.forEach((id) => {
      if (this.commandsMap.has(id)) {
        this.commandsMap.delete(id);
        changed = true;
      }
    });

    if (changed) {
      this.notify();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const commands = this.getCommands();
    this.listeners.forEach((listener) => listener(commands));
  }
}

// Global Singleton Instance
export const registryStore = new RegistryStore();

// React Hook to consume the store
export const useOmniSearchRegistry = () => {
  const [commands, setCommands] = useState(() => registryStore.getCommands());

  useEffect(() => {
    // Subscribe returns an unsubscribe function
    return registryStore.subscribe((newCommands) => {
      setCommands(newCommands);
    });
  }, []);

  return {
    commands,
    register: (cmd) => registryStore.register(cmd),
    unregister: (id) => registryStore.unregister(id),
  };
};

// Deprecated Provider (kept for compatibility or removed if not needed)
// We remove it to force usage of the singleton
export const OmniSearchRegistryProvider = ({ children }) => {
  return children;
};
