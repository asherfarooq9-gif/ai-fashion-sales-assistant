import { describe, it, expect } from 'vitest';
import { transition } from '../../src/services/conversation/stateMachine.js';

describe('conversation state machine', () => {
  it('greeting from NEW sends the menu', () => {
    expect(transition('NEW', { intent: 'greeting' })).toEqual({
      nextState: 'GREETED',
      action: 'send_menu',
    });
  });

  it('product_search routes to recommend', () => {
    expect(transition('GREETED', { intent: 'product_search' }).action).toBe('recommend');
  });

  it('order flow: details -> address -> confirm -> place', () => {
    expect(transition('GREETED', { intent: 'order_placement' }).action).toBe('ask_order_details');
    expect(transition('COLLECTING_ORDER', { intent: 'order_placement', hasItems: true }).action).toBe(
      'ask_address'
    );
    expect(transition('AWAITING_ADDRESS', { hasAddress: true }).action).toBe('confirm_order');
    expect(transition('AWAITING_CONFIRMATION', { confirmed: true }).action).toBe('place_order');
  });

  it('complaint and return go to SUPPORT', () => {
    expect(transition('GREETED', { intent: 'complaint' })).toEqual({
      nextState: 'SUPPORT',
      action: 'handle_complaint',
    });
    expect(transition('GREETED', { intent: 'return_request' }).action).toBe('handle_return');
  });
});
