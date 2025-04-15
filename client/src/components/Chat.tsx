import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

interface Message {
  content: string;
  role: string;
  timestamp?: number;
}

const ChatBox: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { content: '你好！我是小天，有什么可以帮你的吗？', role: 'assistant', timestamp: Date.now() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleEnter = async (inputValue: string) => {
    const lastItem = messages[0];
    const startTime = Date.now();
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer sk-aesxnvjszadfkgauhjsnebrkyaumaykzocnwpcxkwgioasdk`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Qwen/QwQ-32B',
          tools: [
            {
              type: "function",
              function: {
                  name: "multiplication",
                  description: "Calculate the multiplication of two numbers",
                  parameters: {
                      number1:"数字1",
                      number2:"数字2"
                  }
              },
              strict: false
            },
            {
              type: "function",
              function: {
                  name: "weather",
                  description: "获取天气预报数据",
              },
              strict: false
            }
          ],
          stream: false,  // 使用非流式
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1,
          stop: null,
          response_format: { "type": "text" },
          messages: [
            ...messages.slice().reverse().map(item => ({
              role: item.role==='user' ? 'user' : 'assistant',
              content: item.content
            })),
            { role: 'user', content: inputValue }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0].message?.content) {
        lastItem.content = data.choices[0].message.content;
      }
      
      lastItem.timestamp = Math.floor((Date.now() - startTime) / 1000);
      const res = data.choices[0].message;
      console.log(res);
      if(res.content) {
        setMessages(prev => [...prev, { 
          content: res.content, 
          role: 'assistant',
          timestamp: Date.now() 
        }])
      }
      if ('tool_calls' in res){
          console.log('存在方法调用');
          
          const function_name = res.tool_calls[0].function.name;
          console.log('存在方法调用:'+function_name);
          setMessages(prev => [...prev, { 
            content: res.reasoning_content, 
            role: 'assistant',
            timestamp: Date.now() 
          }])

          if (function_name == 'multiplication'){
              //参数获取
              const argumentstemp = res.tool_calls[0].function.arguments;
              const jsonObj = JSON.parse(argumentstemp);
              console.log(jsonObj);
              const num1 = jsonObj.number1
              const num2 = jsonObj.number2
              //返回结果
              const return_obj = num1 * num2
              console.log('计算结果:'+return_obj);
              setMessages(prev => [...prev, { 
                content: '存在方法调用:'+return_obj, 
                role: 'assistant',
                timestamp: Date.now() 
              }])
          }

          // if (function_name == 'weather'){
          //     //返回结果
          //     return_obj = weather()
          //     console.log('天气查询:'+return_obj);
          // }
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        content: '请求失败，请重试', 
        role: 'error',
        timestamp: Date.now() 
      }])
      console.error('API 请求失败:', error);
    } finally {
      // loading.value = false;
      // isStreamLoad.value = false;
    }
  }
  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = { content: inputMessage, role: 'user', timestamp: Date.now() };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      handleEnter(inputMessage)
      // 模拟智能回复
    //   setTimeout(() => {
    //     const replies = [
    //       '我明白你的意思了',
    //       '这个问题很有趣',
    //       '让我想想怎么回答你',
    //       '谢谢你的提问'
    //     ];
    //     const randomReply = replies[Math.floor(Math.random() * replies.length)];
    //     setMessages(prev => [...prev, { 
    //       content: randomReply, 
    //       role: 'assistant',
    //       timestamp: Date.now() 
    //     }]);
    //   }, 800 + Math.random() * 1200);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>小天对话</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${(message.role==='user') ? 'user-message' : 'bot-message'}`}
          >
            {!(message.role==='user') && <div className="avatar">天</div>}
            <div className="message-content">
              {message.content}
              <div className="message-time">
                {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="输入消息..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
};

export default ChatBox;
