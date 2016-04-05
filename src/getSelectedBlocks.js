/**
 * Returns an array of all `ContentBlock` instances within two block keys
 *
 * @param  {object} contentState A draft.js `ContentState` instance
 * @param  {string} anchorKey    The block key to start searching from
 * @param  {string} focusKey     The block key until which to search
 *
 * @return {array} An array containing the found content blocks
 */
export default (contentState, anchorKey, focusKey) => {
  const isSameBlock = anchorKey === focusKey;
  const startingBlock = contentState.getBlockForKey(anchorKey);
  const selectedBlocks = [startingBlock];

  if (!isSameBlock) {
    let blockKey = anchorKey;

    while (blockKey !== focusKey) {
      const nextBlock = contentState.getBlockAfter(blockKey);
      selectedBlocks.push(nextBlock);
      blockKey = nextBlock.getKey();
    }
  }

  return selectedBlocks;
};
