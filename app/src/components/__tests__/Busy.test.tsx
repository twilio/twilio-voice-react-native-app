import '@testing-library/jest-native/extend-expect';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import Busy from '../Busy';
import { createStore } from '../../store/app';

describe('component', () => {
  let store: ReturnType<typeof createStore>;
  let wrapper: React.ComponentType<any>;

  beforeEach(() => {
    store = createStore();
    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  describe('Busy', () => {
    it('should show nothing at first', () => {
      render(<Busy />, { wrapper });
      expect(screen.root).toBeEmptyElement();
    });

    it('should show a loading wheel after 500ms', async () => {
      render(<Busy />, { wrapper });
      await waitFor(() => expect(screen.root.children).toHaveLength(1), {
        timeout: 550,
      });
      const activityIndicator = screen.root.children[0];
      expect(typeof activityIndicator).not.toBe('string');
      expect((activityIndicator as any).type.displayName).toBe(
        'ActivityIndicator',
      );
    });
  });
});
