import { Item, ItemsQuery, Principle, Recipe, Wisdom } from "./gql/graphql"

export type ItemFromQuery = ItemsQuery["item"][number]

export interface VisibleItem extends ItemFromQuery {
    isVisible: boolean
    index: number
}

export type ItemRef = Pick<Item, "id">

export interface KnownSkill {
    id: string
    level: number
    committed_wisdom?: Wisdom
    evolvable_soul?: ItemRef
}

export interface KnownRecipe
    extends Omit<Recipe, "source_aspect" | "source_item" | "product"> {
    product: string
    source_aspect?: string
    source_item?: string
}

export interface UserData {
    items: ItemRef[]
    skills: KnownSkill[]
    recipes: KnownRecipe[]
}

export interface PrincipleCount {
    principle: Principle
    count: number
}
