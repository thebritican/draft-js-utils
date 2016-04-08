/* @flow */
const {describe, it} = global;
import expect from 'expect';
import selectionContainsEntity from '../selectionContainsEntity';
import {EditorState, Entity, Modifier, SelectionState} from 'draft-js';

const DUMMY_ENTITY = 'DUMMY_ENTITY';

const findEntity = (character) => {
  const entityKey = character.getEntity();
  return (
    entityKey !== null &&
    Entity.get(entityKey).getType() === 'DUMMY_ENTITY'
  );
};

const strategy = (contentBlock, callback) => {
  contentBlock.findEntityRanges(findEntity, callback);
};

const insertDummyText = (editorState, text, withEntity) => (
  EditorState.push(
    editorState,
    Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text ? text : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
      undefined,
      withEntity ? (
        Entity.create(
          DUMMY_ENTITY,
          'MUTABLE',
        )
      ) : undefined
    ),
    'insert-characters',
  )
);

let editorState = insertDummyText(EditorState.createEmpty());
editorState = EditorState.push(
  editorState,
  Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection(),
  ),
  'split-block',
);
editorState = insertDummyText(editorState);
editorState = insertDummyText(editorState, 'this contains an entity', true);

const blockMap = editorState.getCurrentContent().getBlockMap();

const first = blockMap.first();
const last = blockMap.last();

editorState = EditorState.forceSelection(
  editorState,
  new SelectionState({
    anchorKey: first.getKey(),
    anchoeOffset: 0,
    focusKey: last.getKey(),
    focusOffset: last.getLength(),
  }),
);

describe('selectionContainsEntity', () => {
  it('should call return a new function when passing in a strategy', () => {
    expect(selectionContainsEntity(strategy)).toBeA('function');
  });

  it('should return true, if an entity which matches the strategy has been found', () => {
    expect(selectionContainsEntity(strategy)(editorState)).toEqual(true);
  });

  it('should return false, if no entity which matches the strategy has been found', () => {
    editorState = EditorState.forceSelection(
      editorState,
      new SelectionState({
        anchorKey: first.getKey(),
        anchoeOffset: 0,
        focusKey: first.getKey(),
        focusOffset: first.getLength(),
      }),
    );

    expect(selectionContainsEntity(strategy)(editorState)).toEqual(false);
  });

  it('should allow passing in a custom selection', () => {
    const lastBlockWithEntity = new SelectionState({
      anchorKey: last.getKey(),
      anchoeOffset: 0,
      focusKey: last.getKey(),
      focusOffset: last.getLength(),
    });

    expect(selectionContainsEntity(strategy)(editorState, lastBlockWithEntity)).toEqual(true);

    const lastBlockWithoutEntity = new SelectionState({
      anchorKey: last.getKey(),
      anchoeOffset: 0,
      focusKey: last.getKey(),
      focusOffset: 10,
    });

    expect(selectionContainsEntity(strategy)(editorState, lastBlockWithoutEntity)).toEqual(false);

    const firstBlockWithoutEntity = new SelectionState({
      anchorKey: first.getKey(),
      anchoeOffset: 0,
      focusKey: first.getKey(),
      focusOffset: first.getLength(),
    });

    expect(selectionContainsEntity(strategy)(editorState, firstBlockWithoutEntity)).toEqual(false);
  });
});
