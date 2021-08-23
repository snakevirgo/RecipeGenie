const express = require('express');
const app = express();
const dff = require('dialogflow-fulfillment');
//const { response } = require('express');
const axios = require('axios');

app.get('/', (req, res) => {
    res.send("this is working")
});

app.post('/', express.json(), (req, resp) => {
    const agent = new dff.WebhookClient({
        request : req,
        response : resp
    });

    function demo(agent){
        agent.add("sending response from webhook server");
    }

     // a random generator
    const getRandom = (len) => {
    const random = Math.floor(Math.random() * len);
     return random;
    }

   
    function findRecipeHandler(agent) {
      let context = agent.getContext('findrecipe');
      let ingredient = context.parameters.mainIngredient;
      let url = 'https://www.themealdb.com/api/json/v1/1/filter.php?i='+ ingredient;

        return axios.get(url)
        .then((res) => {
         let random = getRandom(res.data.meals.length);
        // let dish = res.data.meals[random].strMeal;
         agent.add(`How about ${res.data.meals[random].strMeal}? Please select one of the following.`);
         agent.add(new dff.Suggestion(`Yes, ${res.data.meals[random].strMeal} sounds good`));
         agent.add(new dff.Suggestion(`No thank you`));
             
      })
    }

    function findRecipe_yes(agent){
        let context = agent.getContext('findrecipe-followup');
        let dish = context.parameters.dish;
        let url2 = 'https://www.themealdb.com/api/json/v1/1/search.php?s=' + dish;

        return axios.get(url2)
        .then((res) => {
            agent.add(res.data.meals[0].strArea);

            if(res.data.meals[0].strImageSource){
                agent.add(new dff.Card({
                title: `${res.data.meals[0].strMeal}`,
                imageUrl: `${res.data.meals[0].strMealThumb}`, 
                text: `Cuisine Type: ${res.data.meals[0].strArea}`,
                buttonText: `Click Here for recipe or video`,
                buttonUrl: `${res.data.meals[0].strImageSource}`
                
                

                }));
            }
            else{
                agent.add(new dff.Card({
                    title: `${res.data.meals[0].strMeal}`,
                    imageUrl: `${res.data.meals[0].strMealThumb}`, //'https://assets.bonappetit.com/photos/5e5eb7152d722c00081875a6/1:1/w_1920,c_limit/HLY-Fried-Chicken-16x9.jpg',
                    text: `Cuisine Type: ${res.data.meals[0].strArea}`,
                    buttonText: `Click Here for recipe or video`,
                    buttonUrl: `${res.data.meals[0].strYoutube}`
    
                    }));
            }
        
   
    
    })
  }


  function RecipeCategoriesHandler(agent) {
    
    let url = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';
    agent.add(`I have the following recipe categories: `);

      return axios.get(url)
      .then((res) => {

        for (let i = 0; i < res.data.meals.length; ++i) {
            let x = res.data.meals[i].strCategory;
             agent.add(x);
        }
        
        agent.add( ` This is the end of the list. Thanks for visiting!`);
           
    })
    
   
  }
        


    let intentMap = new Map();

    intentMap.set('functiondemo', demo);
    intentMap.set('findRecipe', findRecipeHandler);
    intentMap.set('findRecipe - yes', findRecipe_yes);
    intentMap.set('RecipeCategories', RecipeCategoriesHandler);

    agent.handleRequest(intentMap);
})

app.listen(8080, ()=>console.log("Server is live at port 8080"));