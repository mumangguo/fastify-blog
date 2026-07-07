

# AiEditor

# Quick Start[](https://aieditor.dev/docs/getting-started.html#quick-start)

## Modern Development Mode[](https://aieditor.dev/docs/getting-started.html#modern-development-mode)

Installation：

```
npm i aieditor
```

Usage：

HTML:

```
<div id="aiEditor" style="height: 550px;  margin: 20px"></div>
```

Typescript:

```
import {AiEditor} from "aieditor";
import "aieditor/dist/style.css"

new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    content: 'AiEditor is an Open Source Rich Text Editor Designed for AI. ',
    ai: {
        models: {
            spark: {
                appId: "***",
                apiKey: "***",
                apiSecret: "***",
            }
        }
    }
})
```



# AiEditor integrates with React[](https://aieditor.dev/docs/aieditor-with-react.html#aieditor-integrates-with-react)

In React, we get the dom node by using `useRef` a hook, and then instantiate it with `new AiEditor` , the sample code is as follows:

jsx

```
import {useEffect, useRef} from 'react'
import {AiEditor} from "aieditor";
import "aieditor/dist/style.css"

function App() {

    //Define Ref
    const divRef = useRef(null);

    //Initialization AiEditor
    useEffect(() => {
        if (divRef.current) {
            const aiEditor = new AiEditor({
                element: divRef.current,
                placeholder: "Click to Input Content...",
                content: 'AiEditor is an Open Source Rich Text Editor Designed for AI. ',
            })
            return ()=>{
                aiEditor.destroy();
            }
        }
    }, [])

    return (
        <>
            <div>
                <h1>AiEditor， an Open Source Rich Text Editor Designed for AI</h1>
            </div>
            <div ref={divRef} style={{height: "600px"}} />
        </>
    )
}

export default App
```

## React Component[](https://aieditor.dev/docs/aieditor-with-react.html#react-component)

jsx

```
// "use client"; // Next.JS

import { AiEditor, AiEditorOptions } from "aieditor";
import "aieditor/dist/style.css";

import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";

type AIEditorProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  options?: Omit<AiEditorOptions, "element">;
};

export default forwardRef<HTMLDivElement, AIEditorProps>(function AIEditor(
  {
    placeholder,
    defaultValue,
    value,
    onChange,
    options,
    ...props
  }: AIEditorProps,
  ref
) {
  const divRef = useRef<HTMLDivElement>(null);
  const aiEditorRef = useRef<AiEditor | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

    if (!aiEditorRef.current) {
      const aiEditor = new AiEditor({
        element: divRef.current,
        placeholder: placeholder,
        content: defaultValue,
        onChange: (ed) => {
          if (typeof onChange === "function") {
            onChange(ed.getMarkdown());
          }
        },
        ...options,
      });

      aiEditorRef.current = aiEditor;
    }

    return () => {
      if (aiEditorRef.current) {
        aiEditorRef.current.destroy();
        aiEditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(divRef.current);
      } else {
        ref.current = divRef.current;
      }
    }
  }, [ref]);

  useEffect(() => {
    if (aiEditorRef.current && value !== aiEditorRef.current.getMarkdown()) {
      aiEditorRef.current.setContent(value || "");
    }
  }, [value]);

  return <div ref={divRef} {...props} />;
});
```

### Example[](https://aieditor.dev/docs/aieditor-with-react.html#example)

jsx

```
const [value, setValue] = useState("");

<AIEditor
    placeholder="描述代码的作用，支持 Markdown 语法.."
    style={{ height: 220 }}
    value={value}
    onChange={(val) => setValue(val)}
/>
```

**in `Next.JS`：**

jsx

```
const AIEditor = dynamic(() => import("./AIEditor"), {
  ssr: false,
  loading: () => <Spin style={{ margin: "0 0 0 10px" }} />,
});

function App(){
    const [value, setValue] = useState("");

    return (<AIEditor
        placeholder="描述代码的作用，支持 Markdown 语法.."
        style={{ height: 220 }}
        value={value}
        onChange={(val) => setValue(val)}
    />);
}
```

For more examples of React integration, please refer to：https://gitee.com/aieditor-team/aieditor/tree/main/demos/react-ts



# AiEditor integrates with Vue3[](https://aieditor.dev/docs/aieditor-with-vue3.html#aieditor-integrates-with-vue3)

In Vue, we use `div` a reference from a `ref` `$refs` property definition and then instantiate with `new AiEditor` , as shown in the sample code:

html

```
<template>
    <div>
        <h1>AiEditor is an Open Source Rich Text Editor Designed for AI.</h1>
    </div>
    <div ref="divRef" style="height: 600px"/>
</template>

<script lang="ts">
    import {AiEditor} from "aieditor";
    import "aieditor/dist/style.css"
    export default {
        mounted(){
            new AiEditor({
                element: this.$refs.divRef as Element,
                placeholder: "Click to Input Content...",
                content: 'AiEditor is an Open Source Rich Text Editor Designed for AI.  ',
            })
        }
    }
</script>
```

Or use `vue` the `setup` syntax:

vue

```
<template>
  <div>
    <h1>AiEditor is an Open Source Rich Text Editor Designed for AI. </h1>
  </div>
  <div ref="divRef" style="height: 600px"/>
</template>

<script setup lang="ts">
import {AiEditor} from "aieditor";
import "aieditor/dist/style.css"
import {onMounted, onUnmounted, ref} from "vue";

const divRef = ref();
let aiEditor: AiEditor | null = null;

onMounted(() => {
  aiEditor = new AiEditor({
    element: divRef.value as Element,
    placeholder: "Click to Input Content...",
    content: 'AiEditor is an Open Source Rich Text Editor Designed for AI.  ',
  })
})

onUnmounted(() => {
  aiEditor && aiEditor.destroy();
})
</script>
```

For more examples of Vue integration, please refer to：https://gitee.com/aieditor-team/aieditor/tree/main/demos/vue-ts

## SSR[](https://aieditor.dev/docs/aieditor-with-vue3.html#ssr)

Regarding SSR reference documents: https://vuejs.org/guide/scaling-up/ssr.html#server-side-rendering-ssr

vue

```
<template>
  <div style="display: block;text-align: start">
    <div ref="divRef" class="aiEditor" style="height: 850px;max-width: 1280px"/>
  </div>
</template>

<script setup lang="ts">
// import {AiEditor} from "aieditor";
import "aieditor/dist/style.css"
import {onMounted, onUnmounted, ref} from "vue";

const divRef = ref();
let aiEditor: any = null;

onMounted(() => {
  //for ssr
  import('aieditor').then(({AiEditor}) => {
    aiEditor = new AiEditor({
      element: divRef.value as Element,
      placeholder: "Click to Input Content...",
      content: 'AiEditor is an Open Source Rich Text Editor Designed for AI.  ',
    })
  })
})

onUnmounted(() => {
  aiEditor && aiEditor.destroy();
})
</script>
```



# Basic configuration[](https://aieditor.dev/docs/config/base.html#basic-configuration)

## Samples[](https://aieditor.dev/docs/config/base.html#samples)

typescript

```
new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    theme: "light",
    content: 'AiEditor is an Open Source Rich Text Editor Designed for AI. ',
    contentIsMarkdown: false,
    contentRetention: true,
    contentRetentionKey: 'ai-editor-content',
    draggable: true,
    pasteAsText: false,
    textCounter: (text: string) => number,
    ai: {
        models: {
            spark: {
                appId: "***",
                apiKey: "***",
                apiSecret: "***",
            }
        }
    }
})
```

- **element**: The DOM node mounted by the editor, which can be a node description of the string type, such as `#editor` or `.editor`, or a DOM node object.
- **placeholder**: A placeholder that appears when the editor has nothing to offer.
- **theme**: The theme can be configured as "light" or "dark", and the default is the light theme.
- **content**: The content of the edit.
- **contentIsMarkdown**: Whether the initialized content is markdown content. If so, you need modify this value to `true`.
- **contentRetention**: Whether to automatically save (cache) the currently edited content, which is set to the following `false` by default.
- **contentRetentionKey**: The key value localStorage that is automatically saved (cached) to , defaults to: `ai-editor-content` .
- **draggable**: Whether the editor can be resized by dragging the lower right corner.
- **pasteAsText**: When pasting, paste as text. When set to `true`, the pasted web page content automatically clears the color, link, font, font size, bold, strikethrough and other styles.
- **textCounter**: Text counter, used to display the current amount of text in the lower right corner. You can customize the counting algorithm here.
- **AI**: For more information about AI-related configurations, see [AI Configuration](https://aieditor.dev/docs/zh/ai/base.html).

> Note: Starting from v1.2.0, if the initialized content is `markdown` content, you need to add the `contentIsMarkdown:true` configuration at the same time.





# Toolbar configuration[](https://aieditor.dev/docs/config/toolbar.html#toolbar-configuration)

## Samples[](https://aieditor.dev/docs/config/toolbar.html#samples)

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarKeys: ["undo", "redo", "brush", "eraser", 
        "|", "heading", "font-family", "font-size", 
        "|", "bold", "italic", "underline", "strike", "link", "code", "subscript", "superscript", "hr", "todo", "emoji", 
        "|", "highlight", "font-color",
        "|", "align", "line-height", 
        "|", "bullet-list", "ordered-list", "indent-decrease", "indent-increase", "break", 
        "|", "image", "video", "attachment", "quote", "code-block", "table", 
        "|", "source-code", "printer", "fullscreen", "ai"
    ],
})
```

The above configuration is the default configuration of the AiEditor tool class, which `"|"` represents the dividing line.

- undo: Undo
- redo: Redo
- brush: Format Brush
- eraser: Clear Formatting
- heading: Text/Heading
- font-family: Font
- font-size: Font Size
- bold: Bold
- italic: Italic
- underline: Underline
- strike: Strikethrough
- link: Link
- code: Inline Code
- subscript: Subscript
- superscript: Superscript
- hr: Divider
- todo: Task List
- emoji: Emoji
- highlight: Highlight
- font-color: Font Color
- align: Align
- line-height: Line Height
- bullet-list: Bullet List
- ordered-list: Ordered List
- indent-decrease: Decrease Indent
- indent-increase: Increase Indent
- break: Line Break
- image: Image
- video: Video
- attachment: Attachment
- quote: Quote
- container: Highlight Block
- code-block: Code Block
- table: Table
- source-code: Source Code
- printer: Print
- fullscreen: Fullscreen
- ai: Artificial Intelligence

In addition, the pro version also supports the following configurations:

- pdf-export: PDF export
- word-export: Word export
- word-import: Word import
- chat: AI conversation

## Set Toolbar Button Size[](https://aieditor.dev/docs/config/toolbar.html#set-toolbar-button-size)

Set the toolbar button size by configuring `toolbarSize`:

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarSize: 'medium', // Default is small, options: 'small' | 'medium' | 'large'
})
```

## Exclude some tools[](https://aieditor.dev/docs/config/toolbar.html#exclude-some-tools)

Configure `toolbarExcludeKeys` to exclude the initialization of some tools. The sample code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarExcludeKeys: ["heading", "font-family", "font-size", "ai"],
})
```

## Customize toolbar[](https://aieditor.dev/docs/config/toolbar.html#customize-toolbar)

In AiEditor, we can customize the extension of the toolbar by making a custom in the `toolbarKeys` configuration, and the configuration sample code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarKeys: ["undo", "redo", "brush", "eraser",
        "|", "heading", "font-family", "font-size",
        "|",
        {
            icon: "<svg .....>",
            html:"<div ...>",
            onClick: (event, editor) => {
                //Click Event
            },
            tip: "Mouseover Tooltip Content",
        },
        "printer", "fullscreen", "ai"
    ],
})
```

Description of custom tool configuration items:

- **icon**: The icon used for menu display, only svg configuration is supported for the time being, and it is recommended to use the icon provided by [https://remixicon.com](https://remixicon.com/) to ensure that the icon style of AiEditor is consistent.
- **HTML**: Customize the HTML content of the menu, this configuration will override the icon configuration, causing the icon not to take effect, `icon` and `html` only one of them can be configured.
- **onClick**: Listens for events in the mouse click menu.
- **tip**: Mouse over the text prompt displayed in the menu, which supports internationalization configuration.

**TIP internationalization configuration sample code**

ts

```
new AiEditor({
    element: "#aiEditor",
    toolbarKeys: ["undo", "redo", "brush", "eraser",
        "|", "heading", "font-family", "font-size",
        "|",
        {
            icon: "<svg .....>",
            html:"<div ...>",
            onClick: (event, editor) => {
                //Click Event
            },
            tip: "myKey",
        },
        "printer", "fullscreen", "ai"
    ],
   i18n: {
        zh :{
            "myKey": "自定义国际化显示中文内容",
        },
        en:{
            "myKey": "Custom your i18n content",
        }
    }
})
```

## Toolbar Grouping[](https://aieditor.dev/docs/config/toolbar.html#toolbar-grouping)

Toolbar grouping means that some tools can be classified into a group, and the menu content will pop up by clicking the group button. As shown in the figure below:

![img](https://aieditor.dev/docs/assets/menu-group.Br2SHqOd.png)

The configuration code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarKeys: ["undo", "redo", "brush", "eraser", 
        "|", "heading", "font-family", "font-size", 
        "|", "bold", "italic", "underline", "strike", "link", "code", "subscript", "superscript", "hr", "todo", "emoji", 
        "|", "highlight", "font-color",
        "|", "align", "line-height", 
        "|", "bullet-list", "ordered-list", "indent-decrease", "indent-increase", "break", 
        "|", "image", "video", "attachment", "quote", "code-block", "table", 
        "|", "source-code", "printer", "fullscreen", "ai",
        {
            // title:"menu group",
            // icon:`<svg.... />`,
            toolbarKeys:["undo", "redo", "brush" ]
        }
    ],
})
```

As shown above, by configuring a `MenuGroup` object in `toolbarKeys`, you can group menus.

`MenuGroup` supports the following configurations:

- **title**: (optional) The content displayed by default when the mouse moves over it
- **icon**: (optional) The icon of the group button
- **toolbarKeys**: (required) The menu keys of the group

**Advanced usage: Customize menus in toolbar groups**

In the menu group, add a customized menu button. The sample code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    toolbarKeys: ["undo", "redo", "brush", "eraser", 
        "|", "heading", "font-family", "font-size", 
        "|", "bold", "italic", "underline", "strike", "link", "code", "subscript", "superscript", "hr", "todo", "emoji", 
        "|", "highlight", "font-color",
        "|", "align", "line-height", 
        "|", "bullet-list", "ordered-list", "indent-decrease", "indent-increase", "break", 
        "|", "image", "video", "attachment", "quote", "code-block", "table", 
        "|", "source-code", "printer", "fullscreen", "ai",
        {
            // title:"menu group",
            // icon:`<svg.... />`,
            toolbarKeys:["undo", "redo", "brush",
                {
                    icon: "<svg .....>",
                    html:"<div ...>",
                    onClick: (event, editor) => {
                        //点击事件
                    },
                    tip: "myKey",
                },
            ]
        }
    ],
})
```

For its specific meaning, please refer to: [#Customize toolbar](https://aieditor.dev/docs/config/toolbar.html#customize-toolbar)



# AI Configuration[](https://aieditor.dev/docs/ai/base.html#ai-configuration)

## Samples[](https://aieditor.dev/docs/ai/base.html#samples)

use ChatGPT

ts

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            openai: {
                apiKey:"sk-alQ96zbDn*****",
                model: 'gpt-4o-mini'
            } as OpenaiModelConfig
        }
    },
})
```

OR other LLMs

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        models:{
            spark:{
                appId:"****",
                apiKey:"****",
                apiSecret:"****",
                version:"v3.5" //support v2.1 v3.1 v3.5 v4.0
            }
        },
        bubblePanelEnable: true,
        bubblePanelModel: "auto",
        bubblePanelIcon: "<svg .....>",
        bubblePanelMenus: [],
        onCreateClientUrl: "...."
    },
})
```

- **models**: Model configuration, supports `openai`, `spark`, `wenxin`, `custom`, for details, please refer to: [here](https://aieditor.dev/docs/ai/llm.html)
- **bubblePanelModel**: The name of the large language model used by the AI Bubble menu
- **bubblePanelIcon**: The custom icon of the AI Bubble menu
- **bubblePanelMenus**: This configuration is referenced [here](https://aieditor.dev/docs/ai/menu.html##bubble-menu)
- **onCreateClientUrl**: Custom URL signing algorithm. Generally, if the editor involves content open to the public, onCreateURL needs to be configured to sign the URL through the server to generate a communication URL.
- **spark**: Configuration for the Spark large model. Supported configurations for the Spark large model include:

typescript

```
protocol?: string,
appId: string,
apiKey?: string,
apiSecret?: string,
version?: string,
```

- **protocol**: Communication protocol, supports ws and wss.
- **appId**: Application ID.
- **apiKey**: API Key.
- **apiSecret**: API secret key.
- **version**: Version, default is v3.1.

## Server-side signature[](https://aieditor.dev/docs/ai/base.html#server-side-signature)

When using AiEditor for internal users, it's acceptable to configure the model's `appId`, `apiKey`, and `apiSecret` on the frontend.

However, for ordinary internet users, `appId`, `apiKey`, and `apiSecret` should not be configured on the frontend. Instead, they should be signed through backend services for Ai request paths. Custom configuration of `onCreateClientUrl` is required to ensure key security.

Samples：

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        models:{
            spark:{
                appId: "****",
            }
        },
        onCreateClientUrl: (modelName, modelConfig, startFn)=>{
            //After obtaining the signed URL from the backend, execute the startFn function and pass the URL as a parameter.
            fetch("/your-path/getUrl?appId="+modelConfig.appId)
                .then(resp=>resp.json)
                .then(json=> {
                    startFn(json.url)
                })
        },
        onTokenConsume(_, __, count) {
            axios.post("/api/v1/resource/doTokenCounting", {
                count
            })
        }
    },
})
```

## Record token consumption[](https://aieditor.dev/docs/ai/base.html#record-token-consumption)

sample：

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            spark: {
                appId: "****",
            }
        },
        onTokenConsume(modelName, modelConfig, count) {
            //This method will be called when a token is consumed.
            axios.post("/api/v1/resource/doTokenCounting", {
                count
            })
        }
    },
})
```





# AI menu configuration[](https://aieditor.dev/docs/ai/menu.html#ai-menu-configuration)

AI menu configuration, used to display the menu content when clicking AI in the top toolbar of the editor, and the AI options in the AI bubble menu that pops up after selecting text.

## Toolbar menu[](https://aieditor.dev/docs/ai/menu.html#toolbar-menu)

![img](https://aieditor.dev/docs/assets/ai-menu.B8zwj3rd.png)

Toolbar menu configuration sample code

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        // models:{...]
        menus:[
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 18.9997H20V13.9997H22V19.9997C22 20.552 21.5523 20.9997 21 20.9997H3C2.44772 20.9997 2 20.552 2 19.9997V13.9997H4V18.9997ZM16.1716 6.9997L12.2218 3.04996L13.636 1.63574L20 7.9997L13.636 14.3637L12.2218 12.9495L16.1716 8.9997H5V6.9997H16.1716Z"></path></svg>`,
                name: "AI continues writing",
                prompt: "Please help me further expand on this passage.",
                text: "focusBefore",
                model: "auto",
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M15 5.25C16.7949 5.25 18.25 3.79493 18.25 2H19.75C19.75 3.79493 21.2051 5.25 23 5.25V6.75C21.2051 6.75 19.75 8.20507 19.75 10H18.25C18.25 8.20507 16.7949 6.75 15 6.75V5.25ZM4 7C4 5.89543 4.89543 5 6 5H13V3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V12H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z"></path></svg>`,
                name: "AI Optimization",
                prompt: "Please help me optimize the content of this passage and provide the result.",
                text: "selected",
                model: "auto",
            },
        ]
    },
})
```

- **icon**: Icon used for menu display, currently only supports SVG configuration. It's recommended to use SVG icons provided by [https://remixicon.com](https://remixicon.com/) to ensure consistency with AiEditor's icon style.
- **name**: Name of the AI menu.
- **prompt**: AI prompt message.
- **text**: Text content, supports `"focusBefore"` and `"selected"` options; `"focusBefore"` indicates getting the text content before the current focus, `"selected"` indicates getting the currently selected text content.
- **model**: The AI LLMs used. Currently, it supports `chatGPT`, `spark` (Spark Big Model), `wenxin` (Wenxin Yiyan) and `custom` (custom type).
- **onClick**: Customize the click event of the current menu item.

**Note:** When `model` is not configured or configured as "`auto`", the first configured large language model will be automatically selected.

## Bubble menu[](https://aieditor.dev/docs/ai/menu.html#bubble-menu)

![img](https://aieditor.dev/docs/assets/ai-bubble-menus.DLSgXLt2.png)

Configuration example code:

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        // models:{...]
        bubblePanelMenus:[
            {
                prompt: `<content>{content}</content>\nPlease help me optimize this content and return the optimized results directly.`,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.1986 9.94447C14.7649 9.5337 14.4859 8.98613 14.4085 8.39384L14.0056 5.31138L11.275 6.79724C10.7503 7.08274 10.1433 7.17888 9.55608 7.06948L6.49998 6.50015L7.06931 9.55625C7.17871 10.1435 7.08257 10.7505 6.79707 11.2751L5.31121 14.0057L8.39367 14.4086C8.98596 14.4861 9.53353 14.7651 9.94431 15.1987L12.0821 17.4557L13.4178 14.6486C13.6745 14.1092 14.109 13.6747 14.6484 13.418L17.4555 12.0823L15.1986 9.94447ZM15.2238 15.5079L13.0111 20.1581C12.8687 20.4573 12.5107 20.5844 12.2115 20.442C12.1448 20.4103 12.0845 20.3665 12.0337 20.3129L8.49229 16.5741C8.39749 16.474 8.27113 16.4096 8.13445 16.3918L3.02816 15.7243C2.69958 15.6814 2.46804 15.3802 2.51099 15.0516C2.52056 14.9784 2.54359 14.9075 2.5789 14.8426L5.04031 10.3192C5.1062 10.1981 5.12839 10.058 5.10314 9.92253L4.16 4.85991C4.09931 4.53414 4.3142 4.22086 4.63997 4.16017C4.7126 4.14664 4.78711 4.14664 4.85974 4.16017L9.92237 5.10331C10.0579 5.12855 10.198 5.10637 10.319 5.04048L14.8424 2.57907C15.1335 2.42068 15.4979 2.52825 15.6562 2.81931C15.6916 2.88421 15.7146 2.95507 15.7241 3.02833L16.3916 8.13462C16.4095 8.2713 16.4739 8.39766 16.5739 8.49245L20.3127 12.0338C20.5533 12.2617 20.5636 12.6415 20.3357 12.8821C20.2849 12.9357 20.2246 12.9795 20.1579 13.0112L15.5078 15.224C15.3833 15.2832 15.283 15.3835 15.2238 15.5079ZM16.0206 17.435L17.4348 16.0208L21.6775 20.2634L20.2633 21.6776L16.0206 17.435Z"></path></svg>`,
                title: 'improve-writing',
            },
            {
                prompt: `<content>{content}</content>\nPlease check this paragraph for spelling or grammatical errors.`,
                icon: ` <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19C12.8284 19 13.5 19.6716 13.5 20.5C13.5 21.3284 12.8284 22 12 22C11.1716 22 10.5 21.3284 10.5 20.5C10.5 19.6716 11.1716 19 12 19ZM6.5 19C7.32843 19 8 19.6716 8 20.5C8 21.3284 7.32843 22 6.5 22C5.67157 22 5 21.3284 5 20.5C5 19.6716 5.67157 19 6.5 19ZM17.5 19C18.3284 19 19 19.6716 19 20.5C19 21.3284 18.3284 22 17.5 22C16.6716 22 16 21.3284 16 20.5C16 19.6716 16.6716 19 17.5 19ZM13 2V4H19V6L17.0322 6.0006C16.2423 8.3666 14.9984 10.5065 13.4107 12.302C14.9544 13.6737 16.7616 14.7204 18.7379 15.3443L18.2017 17.2736C15.8917 16.5557 13.787 15.3326 12.0005 13.7257C10.214 15.332 8.10914 16.5553 5.79891 17.2734L5.26257 15.3442C7.2385 14.7203 9.04543 13.6737 10.5904 12.3021C9.46307 11.0285 8.50916 9.58052 7.76789 8.00128L10.0074 8.00137C10.5706 9.03952 11.2401 10.0037 11.9998 10.8772C13.2283 9.46508 14.2205 7.81616 14.9095 6.00101L5 6V4H11V2H13Z"></path></svg>`,
                title: 'check-spelling-and-grammar',
            },
            '<hr/>',
            {
                prompt: `<content>{content}</content>\nPlease help me translate the above...`,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 15V17C5 18.0544 5.81588 18.9182 6.85074 18.9945L7 19H10V21H7C4.79086 21 3 19.2091 3 17V15H5ZM18 10L22.4 21H20.245L19.044 18H14.954L13.755 21H11.601L16 10H18ZM17 12.8852L15.753 16H18.245L17 12.8852ZM8 2V4H12V11H8V14H6V11H2V4H6V2H8ZM17 3C19.2091 3 21 4.79086 21 7V9H19V7C19 5.89543 18.1046 5 17 5H14V3H17ZM6 6H4V9H6V6ZM10 6H8V9H10V6Z"></path></svg>`,
                title: 'translate',
            },
            {
                prompt: `<content>{content}</content>\nPlease help me summarize the above content and return the summary results directly`,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15C13.6941 9 12.5831 8.16562 12.171 7.0009L11 7C9.9 7 9 7.9 9 9L9.0009 9.17102C10.1656 9.58312 11 10.6941 11 12C11 13.3059 10.1656 14.4169 9.0009 14.829L9 15C9 16.1 9.9 17 11 17L12.1707 17.0001C12.5825 15.8349 13.6937 15 15 15H18C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21H15C13.6941 21 12.5831 20.1656 12.171 19.0009L11 19C8.79 19 7 17.21 7 15H5C3.34315 15 2 13.6569 2 12C2 10.3431 3.34315 9 5 9H7C7 6.79086 8.79086 5 11 5L12.1707 5.00009C12.5825 3.83485 13.6937 3 15 3H18ZM18 17H15C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19H18C18.5523 19 19 18.5523 19 18C19 17.4477 18.5523 17 18 17ZM8 11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H8C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11ZM18 5H15C14.4477 5 14 5.44772 14 6C14 6.55228 14.4477 7 15 7H18C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"></path></svg>`,
                title: 'summarize',
            },
        ]
    },
})
```

- **prompt**: AI prompt
- **icon**: Icon used for menu display, currently only supports svg configuration, svg icon is recommended to use the icon provided by [https://remixicon.com](https://remixicon.com/) to ensure consistency with AiEditor icon style.
- **title**: Name of the AI menu



# Command[](https://aieditor.dev/docs/ai/command.html#command)

AI Command refers to the AI menu that `space + '/'` pops up by typing in the text box.

## Sample[](https://aieditor.dev/docs/ai/command.html#sample)

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        models:{
            openai: {
                apiKey: "sk-alQ96zbDn*****",
                model:"gpt-4o",
            }
        },
        commands:[
            {
                name: "AI Continuation Writing",
                prompt: "Please help me further expand on this passage.",
            },
            {
                name: "AI Inquiry",
                prompt: "...",
            },
        ]
    },
})
```

commands configures the AI menu and supports the following parameters:

- **icon**: icon of the AI enu
- **name**: name of the AI menu
- **prompt**: AI prompt
- **text**: "selected" | "focusBefore" optional, represents the selected text, or the text before the cursor
- **model**: the AI large model used. When `model` is not configured or configured as "`auto`", the first configured large language model will be automatically selected.
- **onClick**: click event callback function, only used for custom functions.



# AI translation function configuration[](https://aieditor.dev/docs/ai/translate.html#ai-translation-function-configuration)

AI translation means that after selecting a text, you can translate its content. As shown in the figure below:

![img](https://aieditor.dev/docs/assets/translate-en.Bx7TIDCJ.png)

## Sample code[](https://aieditor.dev/docs/ai/translate.html#sample-code)

If we need to configure the default translation language, the configuration code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        translate: {
            prompt: (lang, selectedText) => {
                return `Please help me translate the following content into: ${lang}, and return the translation result. The content you need to translate is:\n${selectedText}`
            },
            translateMenuItems: [
                {title: 'English', language:'English'},
                {title: 'Chinese'},
            ],
        }
    },
})
```

- **prompt**: prompt content of the large model
- **translateMenuItem - title**: content used to display in the menu
- **translateMenuItem - language**: the value of `lang` passed to the `prompt()` method. When not configured, the value of `title` is used by default.





# AI Chat[](https://aieditor.dev/docs/ai/chat.html#ai-chat)

AI Chat means that in the menu, by clicking the dialogue button, you can use the edited content to have a dialogue with AI. It mainly provides 4 capabilities:

- Directly select the content of the editor as the context of the dialogue for continuous dialogue.
- The AI content of the dialogue can be inserted (or replaced) into the specified position of the editor at any time.
- Support historical dialogue
- Complete function configuration

> Note: The current function is only available in the commercial Pro version, demonstration address: [http://pro.aieditor.com.cn](http://pro.aieditor.com.cn/)

## Sample Code[](https://aieditor.dev/docs/ai/chat.html#sample-code)

ts

```
new AiEditorPro({
    element: "#aiEditor",
    chat:{
        systemPrompt: "Your name is AIEditor Editing Assistant, you are good at...",
        helloMessage: "Welcome use AIEditor editing assistant, you can...",
        localStorageKey: "aie-chat-messages",
        placeholder: "what's your question?",
        maxHeight: 600,
        maxAttachedMessageCount: 10,
        historyMessageTruncateEnable: false,
        historyMessageTruncateLength: 1000,
        historyMessageTruncateProcessor?: (message: string) => string,
        appendEditorSelectedContentEnable: true,
        appendEditorSelectedContentProcessor?: (userContent: string, selectedContent: string) => string,
        messagesToPayloadProcessor?: (messages: any, aiModel: AiModel) => string,
    },
})
```

## Configuration Instructions[](https://aieditor.dev/docs/ai/chat.html#configuration-instructions)

### systemPrompt[](https://aieditor.dev/docs/ai/chat.html#systemprompt)

`systemPrompt` Messages with the system role act as top-level instructions for models, typically describing what the model should do and how it should generally behave and respond. When `systemPrompt` is configured, each message will carry `systemPrompt`, as shown in the following code:

json

```
{
  "model": "gpt-4o",
  "stream": true,
  "messages": [
    {
      "role": "system",
      "content": "Your name is AIEditor Editorial Assistant, and you are good at text creation and content optimization."
    },
    {
      "role": "user",
      "content": "hello"
    }
  ]
}
```

### helloMessage[](https://aieditor.dev/docs/ai/chat.html#hellomessage)

Used to configure the welcome message when the user first opens the AI dialog.

### localStorageKey[](https://aieditor.dev/docs/ai/chat.html#localstoragekey)

The key value definition of historical messages saved in LocalStorage, the default value is: `aie-chat-messages`

### placeholder[](https://aieditor.dev/docs/ai/chat.html#placeholder)

Set the placeholder attribute of the input box

### maxHeight[](https://aieditor.dev/docs/ai/chat.html#maxheight)

Set the maximum height of the chat window

### maxAttachedMessageCount[](https://aieditor.dev/docs/ai/chat.html#maxattachedmessagecount)

In the history conversation, the maximum number of history messages that can be carried is 10 by default. The more history messages there are, the more tokens are consumed.

### historyMessageTruncateEnable[](https://aieditor.dev/docs/ai/chat.html#historymessagetruncateenable)

Whether to enable historical message truncation, the default value is: `false`.

In the messages responded by AI, there may be some messages with very long content. If we submit these long messages to AI, it may consume a lot of tokens. We can only intercept part of the content and submit it instead of the complete content.

### historyMessageTruncateLength[](https://aieditor.dev/docs/ai/chat.html#historymessagetruncatelength)

The length of the intercepted content. The default value is: `1000`. This configuration is only valid when `historyMessageTruncateEnable: true` is configured.

### historyMessageTruncateProcessor[](https://aieditor.dev/docs/ai/chat.html#historymessagetruncateprocessor)

Customize the history message truncate processor. After this configuration, the configuration of `historyMessageTruncateLength` will become invalid.

In the AI history dialogue compression strategy, in addition to content truncate, there are also multiple strategies such as `summary extraction` and `keyword extraction`, which can be implemented by custom configuration `historyMessageTruncateProcessor`.

### appendEditorSelectedContentEnable[](https://aieditor.dev/docs/ai/chat.html#appendeditorselectedcontentenable)

In the message dialog, whether to automatically append the text content selected by the editor. The default value is: `true`.

### appendEditorSelectedContentProcessor[](https://aieditor.dev/docs/ai/chat.html#appendeditorselectedcontentprocessor)

Customize the handlers of `user message` and `editor selection content`. The default code is as follows:

ts

```
appendEditorSelectedContentProcessor = (userContent, selectedContent)=>{
    return `${userContent}\n${selectedContent}`
}
```

### messagesToPayloadProcessor[](https://aieditor.dev/docs/ai/chat.html#messagestopayloadprocessor)

This configuration is used to convert historical message content into payload, which serves as the body content of AI request. It is only used when customizing large models.



# Code Block AI Configuration[](https://aieditor.dev/docs/ai/codeblock.html#code-block-ai-configuration)

In the code component, there are two AI functionalities related to `"AI comment" `and `"AI code explain" `. As shown in the following image:

![img](https://aieditor.dev/docs/assets/codeblock-ai-en.BhMGZQi-.png)

## Sample[](https://aieditor.dev/docs/ai/codeblock.html#sample)

The above functions need to be configured for AI, and the configuration code is as follows:

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        codeBlock: {
            codeComments: {
                model:"auto",
                prompt:"Help me add some comments to this code, and return the code with comments added. Only return the code.",
            },
            codeExplain: {
                model:"auto",
                prompt:"Help me explain this code, providing an explanation of what the code does. Note that there's no need to explain the comments in the code.",
            }
        }
    },
})
```

- model: Refers to which large model to use.
- prompt: The prompt content for the large model.



# AI prompt[](https://aieditor.dev/docs/ai/prompt.html#ai-prompt)

## Preface[](https://aieditor.dev/docs/ai/prompt.html#preface)

In AIEditor, `AI menu`, `AI command`, and `AI code block` can all be configured with custom prompt words. For example, the menu configuration is as follows

ts

```
new AiEditor({
    element: "#aiEditor",
    ai:{
        // models:{...]
        menus:[
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 18.9997H20V13.9997H22V19.9997C22 20.552 21.5523 20.9997 21 20.9997H3C2.44772 20.9997 2 20.552 2 19.9997V13.9997H4V18.9997ZM16.1716 6.9997L12.2218 3.04996L13.636 1.63574L20 7.9997L13.636 14.3637L12.2218 12.9495L16.1716 8.9997H5V6.9997H16.1716Z"></path></svg>`,
                name: "AI Continuation",
                prompt: "Please help me expand on this passage.",
                text: "focusBefore",
            },
            {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M15 5.25C16.7949 5.25 18.25 3.79493 18.25 2H19.75C19.75 3.79493 21.2051 5.25 23 5.25V6.75C21.2051 6.75 19.75 8.20507 19.75 10H18.25C18.25 8.20507 16.7949 6.75 15 6.75V5.25ZM4 7C4 5.89543 4.89543 5 6 5H13V3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V12H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z"></path></svg>`,
                name: "AI Optimization",
                prompt: "Please help me optimize the content of this text and return the results",
                text: "selected",
            },
        ]
    },
})
```

At this point, the user selects a text in the editor. Assume that the selected text is: "`AIEditor is a good editor`", and then clicks the `AI Optimization` menu.

Then, AIEditor will send the following content to the LLM:



```
AIEditor is a good editor
Please help me optimize the content of this text and return the results
```

And wait for the LLM to response the result, allowing the user to perform subsequent operations. At this point, if the text content selected by the user conflicts with `Please help me optimize the content of this text and return the results` , or may have additional meanings, the content returned by the LLM may not necessarily be what we want.

## `{content}` placeholder[](https://aieditor.dev/docs/ai/prompt.html#content-placeholder)

In order to solve the scenario where the text selected by the user may conflict with the simple prompt definition, AIEditor supports adding a custom placeholder `{content}` in the prompt content.

Suppose our custom prompt is:



```
Please help me optimize the text content and return the result. The text content is:
“{content}”

Note that only English content can be returned, not Chinese content.
```

Then, suppose the user selects the text content of the editor as: "`AIEditor is a good editor`", and then clicks the `AI Optimization` menu, the prompt AIEditor gives to the LLM as follows:



```
Please help me optimize the text content and return the result. The text content is:
“AIEditor is a good editor”

Note that only English content can be returned, not Chinese content.
```

The prompt becomes clearer and easier to use by using the `{content}` placeholder.





# Large language models[](https://aieditor.dev/docs/ai/llm.html#large-language-models)

Currently, AiEditor supports the `Openai（ChatGPT)`, `Spark large model`, `Wenxin Yiyuan` and `custom LLMs`.

## [](https://aieditor.dev/docs/ai/llm.html#)

ts

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            openai: {
                apiKey:"sk-alQ96zbDn*****",
                model:"gpt-4o",
            } as OpenaiModelConfig
        }
    },
})
```

Or use `moonshot` through Openai's config

ts

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            openai: {
                endpoint:"https://api.moonshot.cn",
                model:"moonshot-v1-8k",
                apiKey:"sk-alQ96zb******"
            } as OpenaiModelConfig
        }
    },
})
```

Note that in the above configuration, AIEditor will automatically request the URL `https://api.moonshot.cn/v1/chat/completions` for AI dialogue. If the address of the current large model is not `endpoint` + `/v1/chat/completions`, we need to configure `customUrl`, as shown in the following code:

ts

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            openai: {
                customUrl: "https://api.moonshot.cn/your/custom/path",
                model: "moonshot-v1-8k",
                apiKey: "sk-alQ96zb******"
            }
        }
    },
})
```

## Spark large[](https://aieditor.dev/docs/ai/llm.html#spark-large)

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            spark: {
                appId: "****",
                apiKey: "****",
                apiSecret: "****",
                protocol: "ws", //or wss
                version: "v3.1", //or other
            }
        }
    },
})
```

## Wenxin Yiyuan[](https://aieditor.dev/docs/ai/llm.html#wenxin-yiyuan)

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            wenxin: {
                access_token: "****",
                protocol: "****",
                version: "****"
            }
        }
    },
})
```

## Gitee Ai[](https://aieditor.dev/docs/ai/llm.html#gitee-ai)

Gitee AI's serverless API is used for support currently.

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            gitee:{
                endpoint:"https://ai.gitee.com/api/inference/serverless/KGHCVOPBV7GY/chat/completions",
                apiKey:"***",
            }
        }
    },
})
```

More Gitee AI configurations, such as:

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            gitee:{
                endpoint:"https://ai.gitee.com/api/inference/serverless/KGHCVOPBV7GY/chat/completions",
                apiKey:"***",
                max_tokens: 512,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
            }
        }
    },
})
```

## custom backend types of LLMs[](https://aieditor.dev/docs/ai/llm.html#custom-backend-types-of-llms)

typescript

```
new AiEditor({
    element: "#aiEditor",
    ai: {
        models: {
            custom: {
                url: "http://127.0.0.1:8080/api/v1/ai/chat",
                headers: () => {
                    return {
                        "jwt": "xxxx"
                    }
                },
                wrapPayload: (message: string) => {
                    return JSON.stringify({prompt: message})
                },
                parseMessage: (message: string) => {
                    return {
                        role: "assistant",
                        content: message,
                        // index: number,
                        // //0 represents the first text result; 1 represents the middle text result; 2 represents the last text result.
                        // status: 0|1|2,
                    }
                },
                // protocol: "sse" | "websocket"
            }
        }
    },
})
```

Parameter Description:

- `url`: A string or a method that returns a string.
- `headers`: Custom HTTP header information for SSE requests.
- `wrapPayload`: Converts the user's `prompt` string into the `JSON` format (or other formats) required by the `url` interface.
- `parseMessage`: Converts the body content of the backend response into the `AiMessage` format.

Definition of `AiMessage` is as follows:

ts

```
declare interface AiMessage {
    role: string;
    content: string;
    index: number;
    status: 0 | 1 | 2;
}
```





# API documentation[](https://aieditor.dev/docs/api/aieditor.html#api-documentation)

## Initialize[](https://aieditor.dev/docs/api/aieditor.html#initialize)

AiEditor is the core class of the entire editor, and its initialization code is as follows:

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
})
```

## Methods[](https://aieditor.dev/docs/api/aieditor.html#methods)

Sample：

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
})

//Get the editing content and read it as an HTML string.
const html = aiEditor.getHtml();
console.log(html)
```

AiEditor provides the following methods:

- `getHtml()`: Get the HTML content of the current editor.
- `getJson()`: Get the JSON description data of the current editor.
- `getText()`: Get the plain text content (excluding HTML) of the current editor.
- `getSelectedText()`: Get the plain text content (excluding HTML) of the currently selected text in the editor.
- `getMarkdown()`: Get the markdown-formatted content of the current editor.
- `getOptions()`: Get the configuration information of the current editor.
- `getAttributes(name)`： get the properties of the node or mark at the current focus position.
- `getOutline()`: Get the outline of the content, returning an array with the following format:

json

```
[
    {
        "id":"aie-heading-1",
        "text":"Installation",
        "level":2,
        "pos":1203,
        "size":4
    },
    {
        "id":"aie-heading-2",
        "text":"Usage",
        "level":2,
        "pos":1229,
        "size":4
    },
    {
        "id":"aie-heading-3",
        "text":"Configuration",
        "level":2,
        "pos":2744,
        "size":4
    }
]
```

In the above outline content, each field's meaning is as follows:

> -text: Directory name (or content) -level: Directory level, values range from 1 to 6, corresponding to HTML tags h1 to h6 -pos: Position of the directory node in the document -size: Size of the content of the directory node

- `focus()`: Focus the editor.
- `focusPos(pos)`: Focus on the specified position in the editor.
- `focusStart()`: Focus the editor and set the cursor at the beginning.
- `focusEnd()`: Focus the editor and set the cursor at the end.
- `isFocused()`: Check if the editor is currently focused.
- `blur()`: Blur the editor.
- `insert(content)`: Dynamically insert HTML, text content. **Note:** This method is ineffective when the aiEditor has not gained focus. You can first focus by calling `aiEditor.focus().insert(string)` and then insert content.
- `insertMarkdown(content)`: Dynamically insert markdown content.
- `clear()`: Delete all content in the editor.
- `setEditable(value)`: Set the editing mode of the editor. The value can be true or false.
- `setContent(value)`: Dynamically set the content of the editor, supporting json, html, and text settings.
- `setMarkdownContent(value)`: Dynamically set the content of the editor, supporting the setting of markdown content.
- `clear()`: Delete all content in the editor.
- `isEmpty()`: Check if the editor has any content.
- `removeRetention()`: Remove automatically recorded and saved editing content from the editor.
- `destroy()`: Destroy the current instance, commonly used in React or Vue. It's called when the component is unmounted.
- `changeLang(lang)`: Switch the internationalization language of the current editor. For more information, refer to the 《[Internationalized](https://aieditor.dev/docs/config/i18n.html)》 section in the documentation.

## Listening[](https://aieditor.dev/docs/api/aieditor.html#listening)

## content change[](https://aieditor.dev/docs/api/aieditor.html#content-change)

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    onChange:(aiEditor)=>{
        // When the editor content changes, console.log the editor's HTML content...
        console.log(aiEditor.getHtml())
    }
})
```

### AIEditor get focus[](https://aieditor.dev/docs/api/aieditor.html#aieditor-get-focus)

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    onFocus:(aiEditor)=>{
        console.log("get the focus....")
    }
})
```

### AIEditor Instance Destroy On Blur[](https://aieditor.dev/docs/api/aieditor.html#aieditor-instance-destroy-on-blur)

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    onBlur:(aiEditor)=>{
        console.log("blur....")
    }
})
```

### AIEditor Instance Created[](https://aieditor.dev/docs/api/aieditor.html#aieditor-instance-created)

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    onCreated:(aiEditor)=>{
        console.log("AIEditor instance created....")
    }
})
```

### AIEditor Instance Destroy[](https://aieditor.dev/docs/api/aieditor.html#aieditor-instance-destroy)

typescript

```
const aiEditor = new AiEditor({
    element: "#aiEditor",
    placeholder: "Click to Input Content...",
    onDestroy:(aiEditor)=>{
        console.log("AIEditor instance destory....")
    }
})
```