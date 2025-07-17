
import React, { useEffect } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

// This declaration tells TypeScript about the `ace` object on the global window
declare global {
  interface Window {
    ace: any;
  }
}

interface CodeEditorProps {
  code: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, readOnly = false }) => {
  
  useEffect(() => {
    // This is to ensure Ace is loaded, as we're using a CDN
    // The CDN script should be in index.html
    const ace = window.ace;
    if (ace) {
      ace.require("ace/ext/language_tools");
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
        <AceEditor
            mode="golang"
            theme="monokai"
            onChange={onChange ?? (() => {})}
            name="GOLANG_CODE_EDITOR"
            editorProps={{ $blockScrolling: true }}
            value={code}
            width="100%"
            height="100%"
            fontSize={14}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={!readOnly}
            readOnly={readOnly}
            setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                tabSize: 4,
                readOnly: readOnly,
            }}
        />
    </div>
  );
};
