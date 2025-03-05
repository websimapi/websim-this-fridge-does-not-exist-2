import React from 'react';
import ReactDOM from 'react-dom';

const FridgeGenerator = () => {
  const [room] = React.useState(() => new WebsimSocket());
  const [groceryList, setGroceryList] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [clientId, setClientId] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');
  const [frigeItems, setFridgeItems] = React.useState([]);

  const fridges = React.useSyncExternalStore(
    room.collection('fridge').subscribe,
    () => room.collection('fridge').getList()
  );

  React.useEffect(() => {
    const getCreatorUsername = async () => {
      try {
        const creator = await window.websim.getCreatedBy();
        setUsername(creator.username);
      } catch (err) {
        console.error('Error getting creator:', err);
      }
    };

    getCreatorUsername();
    
    setClientId(room.party.client.id);
    setUsername(room.party.client.username);
    
    room.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'connected') {
        console.log(`Client ${data.clientId}, ${data.username} connected`);
      } else if (data.type === 'disconnected') {
        console.log(`Client ${data.clientId}, ${data.username} disconnected`);
      }
    };
  }, [room]);

  const generateFridge = async (e) => {
    e.preventDefault();
    
    if (!groceryList.trim()) {
      setError('Please enter a grocery list');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // First LLM call to generate text description about the fridge
      const fridgeDescription = await generateFridgeDescription(groceryList);
      
      // Second LLM call to generate items for the fridge based on the description
      const itemsResponse = await generateFridgeItems(fridgeDescription);
      
      // Save to database
      await room.collection('fridge').create({
        groceryList,
        description: fridgeDescription,
        items: itemsResponse,
        timestamp: new Date().toISOString()
      });
      
      setGroceryList('');
    } catch (err) {
      console.error('Error generating fridge:', err);
      setError('Failed to generate fridge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateFridgeDescription = async (groceryList) => {
    try {
      const completion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that creates detailed descriptions of refrigerator contents based on grocery lists. 
            Focus on realistic details such as brands, placement in the fridge, appearance, and state of the foods. 
            Be specific and vivid.`
          },
          {
            role: "user",
            content: `Generate a detailed description of a refrigerator containing these groceries: ${groceryList}. 
            Include details about how the items are arranged, what containers they're in, their brands, and their condition.`
          }
        ]
      });
      
      return completion.content;
    } catch (err) {
      console.error('Error generating fridge description:', err);
      throw err;
    }
  };

  const generateFridgeItems = async (description) => {
    try {
      const completion = await websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that creates detailed JSON lists of refrigerator items based on descriptions.
            Each item should have a name, type (dairy, produce, beverage, etc.), and placement (top shelf, bottom shelf, door, etc.).
            Generate 5-10 items for a realistic fridge layout.`
          },
          {
            role: "user",
            content: `Based on this fridge description: "${description}", generate a JSON array of food items in the fridge.
            Each item should include: name, type, placement, and emoji. 
            Respond directly with JSON, following this JSON schema, and no other text.
            [
              {
                "name": "string",
                "type": "string",
                "placement": "string",
                "emoji": "string"
              }
            ]`
          }
        ],
        json: true
      });
      
      return JSON.parse(completion.content);
    } catch (err) {
      console.error('Error generating fridge items:', err);
      throw err;
    }
  };

  return (
    <div>
      <div className="header">
        <h1>This Fridge Does Not Exist</h1>
        <p>Generate a virtual fridge filled with the groceries you specify</p>
      </div>
      
      <div className="generator-container">
        <form onSubmit={generateFridge}>
          <div className="form-group">
            <label htmlFor="groceryList">Enter your grocery list:</label>
            <textarea 
              id="groceryList"
              value={groceryList}
              onChange={(e) => setGroceryList(e.target.value)}
              placeholder="Example: milk, eggs, cheese, apples, lettuce, chocolate, soda, leftovers"
              disabled={loading}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Fridge'}
          </button>
        </form>
      </div>
      
      <h2>Fridge Gallery</h2>
      {loading && <div className="loading">Generating your fridge...</div>}
      
      <div className="gallery">
        {fridges.map((fridge) => (
          <FridgeCard key={fridge.id} fridge={fridge} />
        ))}
      </div>
    </div>
  );
};

const FridgeCard = ({ fridge }) => {
  return (
    <div className="fridge-card">
      <div className="fridge-container">
        <div className="fridge-door">
          <div className="fridge-handle"></div>
          <div className="fridge-shelf">
            {fridge.items && fridge.items
              .filter(item => item.placement === "top shelf")
              .map((item, index) => (
                <div key={index} className="fridge-item" title={item.name}>
                  <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                </div>
              ))}
          </div>
          <div className="fridge-shelf">
            {fridge.items && fridge.items
              .filter(item => item.placement === "middle shelf")
              .map((item, index) => (
                <div key={index} className="fridge-item" title={item.name}>
                  <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                </div>
              ))}
          </div>
          <div className="fridge-shelf">
            {fridge.items && fridge.items
              .filter(item => item.placement === "bottom shelf" || item.placement === "drawer")
              .map((item, index) => (
                <div key={index} className="fridge-item" title={item.name}>
                  <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="fridge-details">
        <h3>Grocery List:</h3>
        <p>{fridge.groceryList}</p>
        <p className="creator">Created by: {fridge.username}</p>
        <p className="timestamp">{new Date(fridge.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

const App = () => {
  return <FridgeGenerator />;
};

ReactDOM.render(<App />, document.getElementById('app'));

