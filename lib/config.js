'use babel'

export default {
    maximumOpenedTabs: {
        type: 'integer',
        default: 5,
        minimum: 1,
        description: 'The maximum number of tabs before we start removing old ones',
    },
    manualMode: {
        type: 'boolean',
        default: false,
        description: 'If enabled, you will need to use a shortcut in order to trigger a tab cleanup.',
    },
    showPinnedIcon: {
        type: 'boolean',
        default: true,
    },
    neverCloseUnsaved: {
        type: 'boolean',
        default: false,
        description: 'If enabled, we will avoid trying to close unsaved files',
    },
    neverCloseNew: {
        type: 'boolean',
        default: false,
        description: 'If enabled, we will avoid trying to close files that are not yet added to the project repo',
    },
    neverCloseDirty: {
        type: 'boolean',
        default: false,
        description: 'If enabled, we will avoid trying to close files that have not been committed to your repo',
    },
}
