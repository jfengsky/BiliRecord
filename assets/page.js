const BaseUrl = 'https://www.bilibili.com'

const formatUrl = url => {
    let tempUrl = ''
    if (url.indexOf("/video") >= 0) {
        const urlPaths = url.split('?');
        if (url.indexOf(`${BaseUrl}/video`) >= 0) {
            tempUrl = urlPaths[0]
        } else {
            tempUrl = `${BaseUrl}${urlPaths[0]}`
        }
    }
    return tempUrl
}

const getStateName = data => {
    const { state } = data || {}
    let temp = '未学习'
    if (state === '2') {
        temp = '正在学习'
    } else if (state === '3') {
        temp = '已学习'
    }
    return temp
}

(function () {

    // 获取当前页面url
    const loc = window.location;
    const url = `${loc.origin}${loc.pathname}`;

    // 把url发送给background，进行查询
    chrome.extension.sendMessage({ type: 'searchContent', url }, function (response) {
        const stateName = getStateName(response)
        $('#J_side').text(stateName)
    });


    let hasAppendPop = false


    $('body').append(`<div class="side" id="J_side"></div>`);
    $('body').delegate('#J_side', 'click', () => {
        if (!hasAppendPop) {
            $('body').append(`<div class="infopop" id="J_infopop">
            <ul class="radiolist">
                <li>
                    <label>
                        <input type="radio" value="1" name="stype">未学习</li>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="radio" value="2" name="stype">正在学习</li>
                    </label>
                </li>
                <li>
                    <label>
                        <input type="radio" value="3" name="stype">已学习</li>
                    </label>
                </li>
            </ul>
            <div class="recordtxt">
                <textarea id="J_textarea"></textarea>
            </div>
            <div class="subutton">
                <button id="J_submit">提交</button>
                <button id="J_close" class="close">隐藏</button>
            </div>
        </div>`)
        }
        hasAppendPop = true;
        chrome.extension.sendMessage({ type: 'searchContent', url }, function (response) {
            if (response) {
                if (response) {
                    $("#J_textarea").val(response.desc);
                    $.each($("input[type='radio']"), (key, value) => {
                        if ($(value).val() === response.state) {
                            $(value).attr('checked', true)
                        }
                    })
                }
            }
        });

        
        $('body').delegate('#J_close', 'click', () => {
            $('#J_infopop').remove();
            hasAppendPop = false;
        })
    })


    $('body').delegate('#J_submit', 'click', () => {

        const radioVal = $("input[type='radio']:checked").val();

        const textareaVal = $("#J_textarea").val();

        const title = $('h1').attr('title')

        chrome.extension.sendMessage({ type: 'saveContent', url, radioVal, textareaVal, title }, function (response) {});

    })



    /**
     * 标记接下来播放信息,这个不急，延迟1.5秒请求
     */
    let timeout = setTimeout(() => {

        let nextUrlList = []
        
        let boxList = []

        // 查询接下来播放列表
        $.each($("#reco_list .card-box"), (key, value) => {
            const infoBox = $(value).find('.info');
            const aTag = $(infoBox).find('a');
            const tempUrlFm = formatUrl($(aTag.get(0)).attr('href'))
            if (tempUrlFm) {
                nextUrlList.push(tempUrlFm)
                boxList.push({
                    el: value,
                    url: tempUrlFm
                })
            }
        })

        chrome.extension.sendMessage({ type: 'searchList', urls: nextUrlList }, function (response) {
            if (response) {
                const { list } = response
                if(list && list.length){
                    list.forEach(urlItem => {
                        boxList.some(item => {
                            if(item.url === urlItem.url){
                                const stateName = getStateName(urlItem);
                                $(item.el).css('position', 'relative')
                                $(item.el).append(`<div class="litype" title="${urlItem.desc}">${stateName}</div>`)
                                // $($(item.el).find('.count').get(1)).text(stateName)
                                return true
                            }
                            return false
                        })
                    })
                }
            }
        });

        clearTimeout(timeout);
        timeout = null;
    }, 1500)

})();