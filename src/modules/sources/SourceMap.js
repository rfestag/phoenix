import { TestSource } from "./testSource";
import { ADSBSource } from "./adsbSource";
import { ADSBApolloSource } from "./adsbApolloSource";

export const Test = new TestSource();
export const ADSB = new ADSBSource();
export const ADSBApollo = new ADSBApolloSource();
