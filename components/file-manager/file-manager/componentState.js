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

        settings:{
            allowDirCreation: true,
            allowSearch: true,

            allowSelecting: true,
            allowSelectingFiles: true,
            allowSelectingDirectories: true,
            maxSelectedItems: 0,

            listDirectories: true,
            listFiles: true,

            hideActions: false,

            allowDownloads: true,

            allowOpen: true,

            allowUploads: true,
            allowMultipleUploads: true,
            uploadTypes: '*/*',

            allowClipboard: true,

            allowRename: true,
            allowDelete: true,

            allowCompression: true,

            showTree: true,
            scrollTree: true,
            scrollTreeDuration: 600,

            minThumbnailSize: 1,
            maxThumbnailSize: 10,
            thumbnailSizeStep: 0.1,

            operationDelay: 20,
            stepDelay: 10,
            uploadDelay: 300,

            listTimeoutDuration: 100,
            treeTimeoutDuration: 250,
            searchTimeoutDuration: 200,
            itemTransitionDuration: 25,

            maxBottomItems: 5,
        },
        config: {
            thumbnailView: false,
            currentThumbnailSize: 2.5,
            showHiddenFiles: false,
        },

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
        initialSelectedPaths: [],
        initialSelectedItems: [],

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

        downloadingFile: '',

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
            search: null,
            itemClick: null,
            checkNewNameErrors: null,
        },

        defaultItem: {
            name: '',
            extension: '',
            identifier: '',
            newName: '',
            path: '',
            type: null,
            image: false,
            info: {},
            showInfo: false,
            mutable: true,
            busy: false,
            renaming: false,
            confirming: '',
            confirmed: false,
            highlighted: false,
            selected: false,
            archive: false,
            clickCount: 0,
        },

        confirmCallback: null,

        savingFile: false,
        newFileName: null,
        newFileNameMatch: /.*/,

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