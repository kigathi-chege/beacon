type User = {
	id: number;
	name: string;
	email: string;
	role?: string;
	featured_image: FeaturedFile;
	token?: string;
	is_guest: boolean;
	all_permissions: string[];
};

type FeaturedFileVariant = 'sm' | 'md' | 'lg';

type FeaturedFile = {
	id: string;
	relative_url: string;
	slug: string;
	name: string;
	url?: string;
	link?: string;
	size: number;
	extension: string;
	mimetype: string;
	usagecount: number;
	checksum: string;
	viewed_at: string;
};

type Page = {
	id: number;
	name: string;
	slug: string;
	title?: string;
	total_views: number;
	robots_meta_tag?: string;
	sections: Section[];
};

type Section = {
	id: number;
	name: string;
	slug: string;
	title?: string;
	subtitle?: string;
	description?: string;
	misc?: any;
	texts?: iText[];
	buttons?: iButton[];
	sections?: Section[];
};

type iText = {
	id: number;
	name: string;
	slug: string;
	content?: string;
	description?: string;
	icon?: iIcon;
};

type iButton = {
	id: number;
	name: string;
	slug: string;
	text?: string;
	icon?: iIcon;
	misc?: any;
	link?: string;
};

type iIcon = {
	content?: string;
	id: number;
	is_svg: boolean;
	name: string;
	slug: string;
};

type iMenu = {
	created_at?: string;
	id: number;
	filtered_menu_items?: iMenuItem[];
	name?: string;
	slug?: string;
	updated_at?: string;
};

type iMenuItem = {
	created_at?: string;
	descendants?: iMenuItem[];
	icon?: iIcon;
	id: number;
	is_external?: boolean;
	link?: string;
	name?: string;
	order?: number;
	slug: string;
	updated_at: string;
};
