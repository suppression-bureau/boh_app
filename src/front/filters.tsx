import * as types from "./gql/graphql"
import { PRINCIPLES, Principle } from "./types"

type HasAspect = types.Workstation_Slot | types.Item

function getAspects<T extends HasAspect>(datum: T): types.Aspect[] {
    return "accepts" in datum ? datum.accepts : datum.aspects
}

export function withAspects<D extends HasAspect, T extends { d: D } = { d: D }>(
    data: T[],
): (T & { aspects: types.Aspect[] })[] {
    return data.map((data) => ({ ...data, aspects: getAspects(data.d) }))
}

type HasPrinciple =
    | types.Skill
    | types.SkillsQuery["skill"][number]
    | types.Item
    | types.ItemsQuery["item"][number]

export function getPrinciples<T extends HasPrinciple>(datum: T): Principle[] {
    if ("primary_principle" in datum) {
        return [datum.primary_principle, datum.secondary_principle]
    }
    return PRINCIPLES.filter((principle) => datum[principle]).map((id) => ({
        id,
    }))
}

export function withPrinciples<
    D extends HasPrinciple,
    T extends { d: D } = { d: D },
>(data: T[]): (T & { principles: Principle[] })[] {
    return data.map((data) => ({ ...data, principles: getPrinciples(data.d) }))
}

export function filterPrinciples<T extends HasPrinciple>(
    data: { d: T }[],
    principles: types.Principle[],
) {
    const principleIds = new Set(principles.map((principle) => principle.id))
    return withPrinciples(data).filter((item) =>
        item.principles.some(({ id }) => principleIds.has(id)),
    )
}

export function filterAspects<
    D extends HasAspect,
    T extends { d: D } = { d: D },
>(data: T[], aspects: types.Aspect[]) {
    const aspectIds = new Set(aspects.map((aspect) => aspect.id))
    return withAspects(data).filter((item) =>
        item.aspects.some(({ id }) => aspectIds.has(id)),
    )
}
