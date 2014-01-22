CREATE TABLE IF NOT EXISTS `score_samegame` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `playername` text NOT NULL,
  `ruleset` varchar(10) NOT NULL,
  `score` mediumint(8) unsigned NOT NULL,
  `address` varchar(15) NOT NULL,
  `referer` text NOT NULL,
  `colors` smallint(5) unsigned NOT NULL,
  `moves` smallint(5) unsigned NOT NULL,
  `timestamp` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
