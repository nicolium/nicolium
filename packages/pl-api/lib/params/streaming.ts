/**
 * @category Request params
 */
interface StreamingParams {
  /** When stream is set to `list`, use this parameter to specify the list ID. */
  list?: string;
  /** When stream is set to `hashtag` or `hashtag:local`, use this parameter to specify the tag name. */
  tag?: string;
  group?: string;
  /** Domain name of the instance. Required when `stream` is `public:remote` or `public:remote:media`. */
  instance?: string;
}

export { type StreamingParams };
