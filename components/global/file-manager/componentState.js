exports.appState = {
    fileManagerInstancesCache: {},
    fileManagerProtoCache: {
        cachedFileLists: {},
        cachedTreeData: {},
        cachedDeepTreeData: {},
    },
    fileManagerInstances: {},
    fileManagerProtoData: {
        instanceId: '',

        rootElement: null,

        settingsOpen: false,
        fileListBusy: false,
        treeBusy: false,

        treeData: [],
        totalDirs: 0,
        loadedDirs: 0,

        currentFileList: [],

        rootDir: '',
        currentDir: '',
        relativeCurrentDir: '',
        currentDirRelative: null,
        currentFileRelative: null,
        allowedExtensions: [],

        createDirDialog: false,
        creatingDir: false,
        newDir: null,

        search: false,
        searchApplied: false,
        searchQuery: '',

        selectMode: false,
        selectedFiles: [],

        imagePreview: false,
        imagePreviewSrc: '',

        filePreviewExtensionModeMap: {
            'javascript': ['js', 'json'],
            'css': ['css'],
            'htmlmixed': ['html'],
        },
        filePreview: false,
        filePreviewPath: '',
        filePreviewMode: '',
        filePreviewOptions: {},

        viewSelectedItems: false,
        massOperationsVisible: false,
        massOperationConfirming: '',
        massOperationConfirmed: false,

        submenuAutoHide: true,

        archiveName: '',
        uncompressOverwrite: true,

        copyItems: [],
        cutItems: [],
        viewClipboardItems: false,

        allowDownloads: true,
        downloadingFile: '',

        allowUploads: true,
        allowMultipleUploads: true,
        uploadTypes: '*/*',
        uploading: false,
        uploadingFiles: [],
        uploadedFiles: [],
        currentUpload: '',
        currentUploadName: '',
        uploadingPaused: false,
        fileExists: false,
        overwriteConfirmed: false,
        renameConfirmed: false,
        skipConfirmed: false,
        uploadConfirmAll: false,

        fmBusy: false,
        fmListProgress: {
            progress: 0,
            title: '',
            info: ''
        },
        fmTreeProgress: {
            progress: 0,
            title: '',
            info: ''
        },

        timeouts: {
            tree: null,
            list: null,
            search: null
        },
    },
    appModals: {
        fileManagerModal: {
            name: 'file-manager',
            bodyComponent: 'file-manager',
            defaultBodyComponent: 'file-manager',
            modalClassName: 'file-manager-modal',
            busy: true,
            showCancelButton: false,
            showConfirmButton: false,
        },
    }
};