(function () {

    // 根据时间生成文件名
    const getTime = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const dat = date.getDate();

        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        return `${year}-${month}-${dat}-${hour}-${minute}-${second}`
    }

    // 根据数据和文件名生成下载文件
    const download = (filename, text) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // 导出按钮
    $("#J_export").click(() => {
        chrome.extension.sendMessage({ type: 'popexport' }, function (response) {
            const fileName = getTime();
            const { LocalStorageData } = response
            let text = ''
            try {
                text = JSON.stringify(LocalStorageData)
            } catch (e) { }
            if(text){
                download(fileName, text)
                $("#J_export").remove();
            }
            
        });
    })

    // 下载按钮
    $("#J_update").change(e => {
        if(e.target.files && e.target.files.length){
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target.result;
                if(result){
                    try{
                        const json = JSON.parse(result);
                        chrome.extension.sendMessage({ type: 'dataImport', data: json }, function (response) {});
                    }catch(e){}
                }
            }
            reader.readAsText(file);
        }
    })
})();