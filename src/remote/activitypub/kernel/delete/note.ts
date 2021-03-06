import * as debug from 'debug';

import Note from '../../../../models/note';
import { IRemoteUser } from '../../../../models/user';

const log = debug('misskey:activitypub');

export default async function(actor: IRemoteUser, uri: string): Promise<void> {
	log(`Deleting the Note: ${uri}`);

	const note = await Note.findOne({ uri });

	if (note == null) {
		throw new Error('note not found');
	}

	if (!note.userId.equals(actor._id)) {
		throw new Error('投稿を削除しようとしているユーザーは投稿の作成者ではありません');
	}

	Note.update({ _id: note._id }, {
		$set: {
			deletedAt: new Date(),
			text: null,
			textHtml: null,
			mediaIds: [],
			poll: null
		}
	});
}
