# MonCourtier Pro - Documentation

Ce document explique comment configurer et utiliser le sous-domaine `pro.localhost` pour accéder à la page dédiée aux courtiers.

## Configuration

### 1. Modifier le fichier hosts

Pour que votre navigateur reconnaisse le domaine `pro.localhost`, vous devez modifier votre fichier hosts :

#### Windows
1. Ouvrez le Bloc-notes en tant qu'administrateur (clic droit → Exécuter en tant qu'administrateur)
2. Ouvrez le fichier : `C:\Windows\System32\drivers\etc\hosts`
3. Ajoutez la ligne suivante à la fin du fichier :
   ```
   127.0.0.1   pro.localhost
   ```
4. Enregistrez le fichier

#### Mac/Linux
1. Ouvrez un terminal
2. Exécutez : `sudo nano /etc/hosts`
3. Ajoutez la ligne suivante à la fin du fichier :
   ```
   127.0.0.1   pro.localhost
   ```
4. Appuyez sur Ctrl+O puis Entrée pour enregistrer
5. Appuyez sur Ctrl+X pour quitter

### 2. Lancer le serveur de développement

Vous pouvez lancer le serveur de développement avec le domaine pro en utilisant :

```
npm run dev:pro
```

Ou si vous préférez utiliser la commande standard :

```
npm run dev
```

Ensuite, accédez à http://pro.localhost:3000 dans votre navigateur.

## Fonctionnalités

Lorsque vous accédez à l'application via `pro.localhost`, vous verrez :

1. Une interface spécifique destinée aux courtiers
2. Une interface de connexion simplifiée
3. Le contenu adapté avec la mention "MonCourtier Pro"

## Dépannage

Si vous rencontrez des problèmes :

- **Le domaine pro.localhost ne fonctionne pas** : Vérifiez que vous avez correctement modifié votre fichier hosts et redémarré votre navigateur.
  
- **Erreur de connexion** : Assurez-vous que votre serveur de développement est en cours d'exécution.

- **Erreur CORS** : Dans certains cas, vous devrez peut-être désactiver temporairement la politique de sécurité CORS de votre navigateur pour le développement local.

## Production

Pour la production, vous devrez configurer un véritable sous-domaine (par exemple, pro.moncourtier.fr) et mettre à jour la logique de routage en conséquence. 