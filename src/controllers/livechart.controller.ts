import LivechartLastRequest, {
  ILivechartLastRequest,
} from "../models/last-request.model";
import LivechartSubscription, {
  ILivechartSubscription,
} from "../models/subscription.model";

/**
 * Updates the last time a request to livechart was made
 * @param timestamp timestamp value
 */
export const updateLastRequest = async (timestamp: number): Promise<void> => {
  const lastRequest: ILivechartLastRequest = await LivechartLastRequest.findOne();

  if (lastRequest) {
    lastRequest.timestamp = timestamp;
    await lastRequest.save();
  } else {
    const lastReq = new LivechartLastRequest();
    lastReq.timestamp = timestamp;
    await lastReq.save();
  }
};

/**
 * Gets the timestamp value of the last request made to livechart
 */
export const getLastRequest = async (): Promise<number> => {
  const lastRequest: ILivechartLastRequest = await LivechartLastRequest.findOne();

  return lastRequest ? lastRequest.timestamp : 0;
};

/**
 * Subscribes a user to an anime in a server
 * @param server Server where the subscription was set
 * @param user User that is subscribing
 * @param id The livechart id of the anime they're subscribing
 */
export const setSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<void> => {
  if (!(await checkSubscription(server, user, id))) {
    const sub = new LivechartSubscription();
    sub.server = server;
    sub.user = user;
    sub.id = id;
    await sub.save();
  }
};

/**
 * Get all subscriptions to the livechart id
 * @param id Livechart id to find subscriptions
 */
export const getSubscriptions = async (
  id: number
): Promise<ILivechartSubscription[]> => {
  return await LivechartSubscription.find({
    id: id,
  });
};

/**
 * Checks if a subscription exists
 * @param server Server id
 * @param user User id
 * @param id Livechart id
 */
export const checkSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<boolean> => {
  return await LivechartSubscription.exists({
    server,
    user,
    id,
  });
};

/**
 * Removes a subscription
 * @param server Server id
 * @param user User id
 * @param id Livechart id
 */
export const removeSubscription = async (
  server: string,
  user: string,
  id: number
): Promise<void> => {
  await LivechartSubscription.deleteOne({
    server,
    user,
    id,
  });
};

/**
 * Get list of livechart ids a user is subscribed in that server
 * @param server Server id
 * @param user User id
 */
export const getUserSubscriptions = async (
  server: string,
  user: string
): Promise<number[]> => {
  const list: ILivechartSubscription[] = await LivechartSubscription.find({
    server,
    user,
  });

  return list.map((l) => l.id);
};
