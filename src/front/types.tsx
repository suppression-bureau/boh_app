import { Item, ItemsQuery, Skill, Wisdom } from "./gql/graphql"

export type ItemFromQuery = ItemsQuery["item"][number]

export interface VisibleItem extends ItemFromQuery {
    isVisible: boolean
    index: number
}

export type ItemRef = Pick<Item, "id">
type SkillRef = Pick<Skill, "id">

export interface KnownSkill {
    id: string
    level: number
    committed_wisdom?: Wisdom
    evolvable_soul?: ItemRef
}

export interface KnownRecipe {
    id: string
    skills: SkillRef[]
}

export interface UserData {
    items: ItemRef[]
    skills: KnownSkill[]
    recipes: KnownRecipe[]
}
