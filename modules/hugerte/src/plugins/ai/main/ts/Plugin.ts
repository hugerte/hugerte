import PluginManager from 'hugerte/core/api/PluginManager';

export default (): void => {
  PluginManager.add('ai', (editor) => {
    const OPENAI = editor.getParam('openai')

    const openDialog = () => {
      /**
       * Create a list of prompts for the select box
       */
      const PROMPTS = OPENAI.prompts
        ? OPENAI.prompts.map((prompt: string) => {
          return { text: prompt, value: `PROMPT: ${prompt}\n` }
        })
        : []
      PROMPTS.unshift({ text: 'Custom Prompt', value: '' })

      return editor.windowManager.open({
        title: 'ChatGPT',
        body: {
          type: 'panel',
          items: [
            {
              type: 'textarea',
              name: 'chatgpt',
              label: 'Provide your input here'
            },
            {
              type: 'selectbox',
              name: 'prompt',
              label: 'Select a prompt',
              items: PROMPTS
            },
            {
              type: 'htmlpanel',
              html: '<p style="font-size: 11px;text-align: center;margin-top:12px;">An opensource plugin for <a href="https://openai.com/" target="_blank">ChatGPT</a>. Made by <a target="_blank" href="https://github.com/The-3Labs-Team/tinymce-chatgpt-plugin/tree/main">3Labs</a>. All rights reserved.</p>'
            }
          ]
        },
        buttons: [
          {
            type: 'cancel',
            text: 'Close'
          },
          {
            type: 'submit',
            text: 'Generate',
            primary: true
          }
        ],

        /**
         * Set the default input to the current selection
         */
        initialData: {
          // @ts-expect-error
          chatgpt: hugerte.activeEditor.selection.getContent() ?? '' // TODO
        },

        onSubmit: function (api) {
          // Change button text to "Loading" again
          api.block('Loading...')

          const data = api.getData()
          const input = data.chatgpt
          let prompt = data.prompt ?? ''
          prompt += input

          getResponseFromOpenAI(prompt)
            .then((res) => res.json())
            .then((data) => {
              // Define the reply
              const reply = data.choices[0].message.content
              // Insert the reply into the editor
              editor.insertContent(reply)
              // Close the dialog
              api.close()
            })
            .catch((error) => {
              console.log('something went wrong' + error)
            })
        }
      })
    }

    /** Get the current selection and set it as the default input */
    const getResponseFromOpenAI = (prompt: string): Promise<Response> => {
      const baseUri = OPENAI.baseUri || 'https://api.openai.com/v1/chat/completions'

      const requestBody = {
        model: OPENAI.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: OPENAI.temperature,
        max_tokens: OPENAI.max_tokens
      }

      return fetch(baseUri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + OPENAI.api_key
        },
        body: JSON.stringify(requestBody)
      })
    }

    /* Add a chatgpt icon */
    editor.ui.registry.addIcon(
      'chatgpt',
      '<svg height="1em" viewBox="0 0 512 512" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n' +
        '    <g transform="matrix(0.752666,0,0,0.752666,3.40764,1.00216e-05)">\n' +
        '        <path d="M626.946,278.404C642.364,232.101 637.051,181.325 612.382,139.217C575.374,74.759 500.459,41.386 427.788,56.984C395.4,20.483 348.773,-0.304 299.975,0.003C225.676,-0.176 159.333,47.976 136.475,118.672C88.648,128.462 47.309,158.452 23.157,200.878C-14.146,265.155 -5.591,346.707 44.238,401.845C28.822,448.148 34.134,498.924 58.802,541.033C95.814,605.486 170.726,638.857 243.397,623.264C275.785,659.766 322.412,680.553 371.21,680.245C445.546,680.439 511.924,632.251 534.764,561.51C582.591,551.72 623.931,521.73 648.082,479.304C685.337,415.03 676.762,333.517 626.946,278.404ZM371.265,635.776C341.452,635.818 312.555,625.371 289.662,606.273C290.694,605.711 292.506,604.717 293.686,603.995L429.13,525.758C436.042,521.824 440.307,514.44 440.261,506.488L440.261,315.537L497.511,348.594C498.12,348.897 498.538,349.486 498.623,350.162L498.623,508.297C498.535,578.151 441.118,635.622 371.265,635.776ZM97.371,518.799C82.437,492.996 77.052,462.743 82.163,433.373C83.169,433.977 84.926,435.05 86.186,435.774L221.63,514.01C228.493,518.023 237.016,518.023 243.879,514.01L409.243,418.528L409.243,484.642C409.281,485.326 408.974,485.987 408.425,486.398L271.505,565.452C210.932,600.337 132.39,579.295 97.371,518.799L97.371,518.799ZM61.739,223.111C76.608,197.275 100.107,177.48 128.094,167.217C128.094,168.384 128.027,170.45 128.027,171.884L128.027,328.356C127.978,336.303 132.238,343.682 139.144,347.614L304.507,443.083L247.259,476.138C246.685,476.516 245.959,476.582 245.327,476.314L108.394,397.192C47.928,362.175 26.889,283.674 61.739,223.111ZM532.096,332.567L366.731,237.085L423.981,204.042C424.554,203.664 425.28,203.599 425.911,203.869L562.845,282.922C602.234,305.674 626.576,347.845 626.576,393.332C626.576,446.63 593.157,494.554 543.145,512.977L543.145,351.825C543.209,343.892 538.977,336.515 532.096,332.567ZM589.075,246.808C588.07,246.191 586.313,245.131 585.053,244.408L449.607,166.171C442.743,162.165 434.224,162.165 427.36,166.171L261.996,261.654L261.996,195.541C261.958,194.856 262.266,194.196 262.814,193.784L399.735,114.796C419.1,103.63 441.066,97.751 463.42,97.751C533.36,97.751 590.912,155.303 590.912,225.243C590.912,232.471 590.297,239.685 589.075,246.808L589.075,246.808ZM230.872,364.646L173.608,331.589C172.998,331.286 172.58,330.695 172.496,330.019L172.496,171.884C172.542,101.975 230.08,44.475 299.989,44.475C329.787,44.475 358.663,54.922 381.564,73.988C380.531,74.552 378.734,75.544 377.54,76.268L242.096,154.504C235.184,158.432 230.919,165.812 230.965,173.761L230.872,364.646ZM261.969,297.594L335.62,255.056L409.269,297.566L409.269,382.614L335.62,425.127L261.969,382.614L261.969,297.594Z" style="fill-rule:nonzero;"/>\n' +
        '    </g>\n' +
        '</svg>\n'
    )

    /* Add a button that opens a window */
    editor.ui.registry.addButton('chatgpt', {
      icon: 'chatgpt',
      tooltip: 'ChatGPT',
      onAction: function () {
        /* Open window */
        openDialog()
      }
    })

    /* Adds a menu item, which can then be included in any menu via the menu/menubar configuration */
    editor.ui.registry.addMenuItem('chatgpt', {
      text: 'ChatGPT',
      onAction: function () {
        /* Open window */
        openDialog()
      }
    })
  });
}
