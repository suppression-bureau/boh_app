import { SyntheticEvent, useCallback, useMemo, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { ItemsDrawerContextProvider } from "../components/ItemsDrawer/context"
import { graphql } from "../gql"
import { ProductsQuery } from "../gql/graphql"
import { KnownRecipe } from "../types"
import { useUserDataContext } from "../userContext"
import { Aspect } from "./Aspects"
import { SingleItemView } from "./Items"
import { PrincipleCard } from "./Principles"
import { SkillsStack } from "./Skills"

export const productsQueryDocument = graphql(`
    query Products {
        item {
            id
            name
            aspects {
                id
            }
            source_recipe {
                id
                source_item {
                    id
                }
                principle
                principle_amount
                source_aspect {
                    id
                }
            }
        }
    }
`)

type ProductItem = ProductsQuery["item"][number]

interface RecipeProps {
    recipe: KnownRecipe
}

const RecipeSource = ({ recipe }: RecipeProps) => (
    <>
        {recipe.source_aspect && <Aspect id={recipe.source_aspect} />}
        {recipe.source_item && <SingleItemView itemId={recipe.source_item} />}
    </>
)

const RecipeView = (recipe: KnownRecipe) => {
    const skillIdSet = new Set(recipe.skills.map(({ id }) => id))
    const hasSource =
        recipe.source_item !== undefined || recipe.source_aspect !== undefined
    return (
        <Stack spacing={2} maxWidth="400px">
            <Typography variant="h5"> Principle </Typography>
            <PrincipleCard
                id={recipe.principle}
                title={recipe.principle_amount}
            />
            {hasSource && (
                <>
                    <Typography variant="h5"> Source </Typography>
                    <RecipeSource recipe={recipe} />
                </>
            )}
            <Typography variant="h5"> Skills </Typography>
            <SkillsStack
                skillIdSet={skillIdSet}
                selectedPrinciples={[recipe.principle]}
            ></SkillsStack>
        </Stack>
    )
}

const RecipesView = (recipeProduct: ProductItem) => {
    const { knownRecipes } = useUserDataContext()
    const productRecipes = knownRecipes.filter(
        ({ product }) => product === recipeProduct.id,
    )

    return (
        <Stack>
            {productRecipes.map((recipe) => (
                <RecipeView key={recipe.id} {...recipe} />
            ))}
        </Stack>
    )
}

const CraftView = () => {
    const [{ data }] = useQuery({ query: productsQueryDocument })
    const [product, setProduct] = useState<ProductItem | undefined>()
    const { knownRecipes } = useUserDataContext()

    const knownRecipeSet = useMemo(
        () => new Set(knownRecipes.map(({ id }) => id)),
        [knownRecipes],
    )

    const userKnownRecipes: ProductItem[] = useMemo(
        () =>
            data!.item
                .filter(({ source_recipe }) => source_recipe.length > 0)
                .filter(({ source_recipe }) =>
                    source_recipe.some(({ id }) => knownRecipeSet.has(id)),
                ),
        [data, knownRecipeSet],
    )
    const handleProductSelect = useCallback(
        (_: SyntheticEvent, product?: ProductItem | null) => {
            setProduct(product ?? undefined)
        },
        [setProduct],
    )
    // maybe try a query for the item instead of context provider
    return (
        <ItemsDrawerContextProvider>
            <Stack
                maxWidth="md"
                justifyContent="center"
                marginInline="auto"
                marginBlock={2}
            >
                <Autocomplete
                    options={userKnownRecipes}
                    getOptionLabel={({ name }) => name}
                    isOptionEqualToValue={(a, b) => a.name === b.name}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Item to Craft" />
                    )}
                    onChange={handleProductSelect}
                />
                {product && <RecipesView {...product} />}
            </Stack>
        </ItemsDrawerContextProvider>
    )
}

export default CraftView
