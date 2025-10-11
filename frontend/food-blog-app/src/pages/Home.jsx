import React from "react"
import foodRecipe from '../assets/foodRecipe.png'
import RecipeItems from "../components/RecipeItems"


export default function Home(){
  return (
    <>
    <section className='home'>
      <div className="left">
        <h1>Food Recipe</h1>
        <h5>At Food Recipe, we believe that healthy eating doesn’t have to be boring. 
Explore our collection of balanced meals, made with natural ingredients and bursting with flavor, 
to help you nourish your body and delight your taste buds.</h5>
        <button>Share your recipe</button>
      </div>
      <div className="right">
        <img src={foodRecipe} width="320px" height="300px"></img>
      </div>
    </section>
    <div className="bg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#c9e6c5" fillOpacity="1" d="M0,128L26.7,106.7C53.3,85,107,43,160,26.7C213.3,11,267,21,320,37.3C373.3,53,427,75,480,96C533.3,117,587,139,640,133.3C693.3,128,747,96,800,101.3C853.3,107,907,149,960,160C1013.3,171,1067,149,1120,165.3C1173.3,181,1227,235,1280,229.3C1333.3,224,1387,160,1413,128L1440,96L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"></path></svg>
    </div>

    <div className='recipe'>
        <RecipeItems/>
    </div>
    </>
  )
}