import { SyntheticEvent, useCallback, useMemo, useState } from "react"
import { useQuery } from "urql"

import Autocomplete from "@mui/material/Autocomplete"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"

import { graphql } from "../gql"
import { RecipesQuery } from "../gql/graphql"
import { ProductItem } from "../types"
import { useUserDataContext } from "../userContext"

export const recipeQueryDocument = graphql(`
    query Recipes {
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

type RecipeFromQuery = RecipesQuery["item"][number]

const CraftView = () => {
    const [{ data }] = useQuery({ query: recipeQueryDocument })
    const [product, setProduct] = useState<ProductItem | undefined>()
    const { knownRecipes } = useUserDataContext()

    const knownRecipeSet = useMemo(
        () => new Set(knownRecipes.map(({ id }) => id)),
        [knownRecipes],
    )

    const userKnownRecipes: RecipeFromQuery[] = useMemo(
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
    return (
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
            Selected: {product?.name}
        </Stack>
    )
}

export default CraftView
