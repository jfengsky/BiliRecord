const DataName = 'BiliData'

const getLocalStorageData = () => {
    const LocalStorageDataStr = localStorage.getItem(DataName)
    let LocalStorageData = null
    if (LocalStorageDataStr) {
        LocalStorageData = JSON.parse(LocalStorageDataStr);
    }
    return LocalStorageData
}

const filterData = (urls, LocalStorageData) => {
    if (urls && urls.length && LocalStorageData && LocalStorageData.length) {
        let list = []
        urls.forEach(url => {
            LocalStorageData.some(item => {
                if (item.url === url) {
                    list.push({
                        url,
                        state: item.state,
                        desc: item.desc
                    })
                }
            })
        });
        return list
    }
    return null
}

const getDataInfo = (url, LocalStorageData) => {
    let temp = null;
    if (LocalStorageData) {
        LocalStorageData.some(item => {
            if (item.url === url) {
                temp = item
            }
            return false
        })
    }

    return temp
}

const addData = (data, LocalStorageData) => {
    let temp = []
    let hasItem = false
    let itemIndex = -1;
    if (LocalStorageData) {

        temp = [...LocalStorageData]
        temp.some((item, index) => {
            if (item.url === data.url) {
                hasItem = true;
                itemIndex = index;
                return true
            }
            return false
        })
    }
    if (!hasItem) {
        temp.push(data)
    } else {
        temp[itemIndex] = data;
    }
    return temp
}

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        LocalStorageData = getLocalStorageData()
        if (request.type === 'searchContent') {
            const data = getDataInfo(request.url, LocalStorageData)
            sendResponse(data);
        } else if (request.type === 'saveContent') {
            const { url, radioVal, textareaVal, title } = request
            const tempData = addData({ url, title, state: radioVal, desc: textareaVal }, LocalStorageData)
            localStorage.setItem(DataName, JSON.stringify(tempData))
            sendResponse('content success');
        } else if (request.type === 'searchList') {
            const { urls } = request
            const filterList = filterData(urls, LocalStorageData)
            sendResponse({ list: filterList });
        } else if( request.type === 'popexport'){
            sendResponse({LocalStorageData})
        } else if( request.type === 'dataImport'){
            const tempUpData = request.data;
            localStorage.setItem(DataName, JSON.stringify(tempUpData))
            sendResponse('updata success')
        }
    }
);