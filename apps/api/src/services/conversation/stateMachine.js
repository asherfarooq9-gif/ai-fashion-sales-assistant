/**
 * transition — decide the next conversation state and the action to run,
 * given the current state and the detected intent/entities.
 *
 * @returns {{ nextState:string, action:string }}
 */
export function transition(state, ctx = {}) {
  const { intent, hasAddress, confirmed, hasPendingOrder } = ctx;

  // Address / confirmation flow takes priority once an order is in progress.
  if (state === 'AWAITING_ADDRESS') {
    if (hasAddress) return { nextState: 'AWAITING_CONFIRMATION', action: 'confirm_order' };
    return { nextState: 'AWAITING_ADDRESS', action: 'ask_address' };
  }
  if (state === 'AWAITING_CONFIRMATION') {
    if (confirmed) return { nextState: 'ORDER_PLACED', action: 'place_order' };
    if (hasAddress) return { nextState: 'AWAITING_CONFIRMATION', action: 'confirm_order' };
    return { nextState: 'AWAITING_CONFIRMATION', action: 'confirm_order' };
  }
  if (state === 'COLLECTING_ORDER') {
    if (confirmed && hasAddress) return { nextState: 'ORDER_PLACED', action: 'place_order' };
    if (hasAddress) return { nextState: 'AWAITING_CONFIRMATION', action: 'confirm_order' };
    return { nextState: 'AWAITING_ADDRESS', action: 'ask_address' };
  }

  switch (intent) {
    case 'greeting':
      return { nextState: 'GREETED', action: 'send_menu' };
    case 'product_search':
      return { nextState: 'BROWSING', action: 'recommend' };
    case 'discount_inquiry':
      return { nextState: 'BROWSING', action: 'show_discounts' };
    case 'delivery_inquiry':
      return { nextState: state === 'NEW' ? 'GREETED' : state, action: 'track_or_delivery' };
    case 'order_placement':
      if (hasAddress && confirmed) return { nextState: 'ORDER_PLACED', action: 'place_order' };
      if (hasPendingOrder || ctx.hasItems) {
        return hasAddress
          ? { nextState: 'AWAITING_CONFIRMATION', action: 'confirm_order' }
          : { nextState: 'AWAITING_ADDRESS', action: 'ask_address' };
      }
      return { nextState: 'COLLECTING_ORDER', action: 'ask_order_details' };
    case 'complaint':
      return { nextState: 'SUPPORT', action: 'handle_complaint' };
    case 'return_request':
      return { nextState: 'SUPPORT', action: 'handle_return' };
    default:
      return { nextState: state === 'NEW' ? 'GREETED' : state, action: 'freeform' };
  }
}

export default transition;
