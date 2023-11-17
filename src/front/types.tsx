import * as types from "./gql/graphql"

export type ItemFromQuery = types.ItemsQuery["item"][number]

export interface VisibleItem extends ItemFromQuery {
    isVisible: boolean
    index: number
}

export type ItemRef = Pick<types.Item, "id">
type SkillRef = Pick<types.Skill, "id">

export interface KnownSkill {
    id: string
    level: number
    committed_wisdom?: types.Wisdom
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
